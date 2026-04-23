<?php

namespace App\Services;

use App\Models\ClassUnit;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Services\DomainScoringService;

class CPSATSchedulerService
{
    protected $scoring;

    public function __construct(DomainScoringService $scoring)
    {
        $this->scoring = $scoring;
    }

    /**
     * MAIN ENTRY POINT
     */
    public function generateSchedule($versionId)
    {
        $units = ClassUnit::where('status', 'generated')->get();
        $teachers = Faculty::all();
        $rooms = Room::all();
        $timeslots = TimeSlot::all();

        // Prepare data for Python
        $data = $this->prepareSolverData($units, $teachers, $rooms, $timeslots);

        // Run Python CP-SAT Solver
        $result = $this->runPythonSolver($data);

        // Save result
        return $this->saveScheduleFromPython($result, $versionId);
    }

    /**
     * PREPARE CLEAN DATA FOR PYTHON
     */
    private function prepareSolverData($units, $teachers, $rooms, $timeslots)
    {
        $scores = [];

        foreach ($units as $unit) {
            foreach ($teachers as $teacher) {

                $score = $this->scoring->calculateTeacherScore(
                    $teacher,
                    $unit->subject
                );

                $scores[$unit->id . "_" . $teacher->id] = $score;
            }
        }

        return [
            'class_units' => $units->map(fn($u) => [
                'id' => $u->id,
                'section_id' => $u->section_id,
                'subject_id' => $u->subject_id,
            ])->values()->toArray(),

            'teachers' => $teachers->map(fn($t) => [
                'id' => $t->id,
            ])->values()->toArray(),

            'rooms' => $rooms->map(fn($r) => [
                'id' => $r->id,
            ])->values()->toArray(),

            'timeslots' => $timeslots->map(fn($ts) => [
                'id' => $ts->id,
            ])->values()->toArray(),

            'scores' => $scores
        ];
    }

    /**
     * CALL PYTHON SOLVER
     */
    private function runPythonSolver($data)
    {
        $json = json_encode($data);

        $pythonPath = "python3"; // or "python" if needed
        $scriptPath = base_path('python_engine/cp_sat_solver.py');

        $command = $pythonPath . " " . $scriptPath . " '" . addslashes($json) . "'";

        $output = shell_exec($command);

        return json_decode($output, true);
    }

    /**
     * SAVE RESULT FROM PYTHON
     */
    private function saveScheduleFromPython($result, $versionId)
    {
        if (!$result || isset($result['status'])) {
            return null;
        }

        foreach ($result as $item) {

            $unit = ClassUnit::find($item['unit_id']);
            $teacher = Faculty::find($item['teacher_id']);

            Schedule::create([
                'section_id' => $unit->section_id,
                'subject_id' => $unit->subject_id,
                'teacher_id' => $item['teacher_id'],
                'room_id' => $item['room_id'],
                'timeslot_id' => $item['timeslot_id'],
                'version_id' => $versionId,
                'set_type' => 'A',
                'score' => $this->scoring->calculateTeacherScore(
                    $teacher,
                    $unit->subject
                ),
                'status' => 'active'
            ]);
        }

        return true;
    }
}