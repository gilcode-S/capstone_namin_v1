<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\SectionSubjectAssignment;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;

use App\Services\Scheduler\ClassUnitService;
use App\Services\Scheduler\ScheduleCandidateBuilderService;
use App\Services\CPSATService;
use App\Services\ScheduleCandidateBuilderService as ServicesScheduleCandidateBuilderService;
use App\Services\Scheduler\ScheduleWriterService;
use App\Services\ScheduleWriterService as ServicesScheduleWriterService;

class GenerateController extends Controller
{
    // ================================
    // UI PAGE (GENERATE SCREEN)
    // ================================
    public function index()
    {
        $versions = ScheduleVersion::with('semester')->get();

        $timeSlots = TimeSlot::all()->map(fn($t) => [
            'id' => $t->id,
            'day_of_week' => $t->day_of_week,
            'start_time' => $t->start_time,
            'end_time' => $t->end_time,
            'mode' => $t->mode,
            'status' => $t->status,
        ])->values();

        $rooms = Room::all()->map(fn($r) => [
            'id' => $r->id,
            'room_name' => $r->room_name,
        ])->values();

        $assignments = SectionSubjectAssignment::with([
            'section.program',
            'subject',
            'faculty'
        ])->get()->map(fn($a) => [
            'id' => $a->id,
            'section_id' => $a->section_id,
            'subject_id' => $a->subject_id,
            'faculty_id' => $a->faculty_id,
        ])->values();

        return Inertia::render("Schedules/Generate", [
            'versions' => $versions,
            'timeSlots' => $timeSlots,
            'rooms' => $rooms,
            'assignments' => $assignments,
        ]);
    }

    // ================================
    // RESET SCHEDULE
    // ================================
    public function reset($versionId)
    {
        Schedule::where('schedule_version_id', $versionId)->delete();

        return redirect()
            ->route('schedules.index')
            ->with('success', 'Schedule reset successfully');
    }

    // ================================
    // GENERATE SCHEDULE (FULL PIPELINE)
    // ================================
    public function generate(
        $versionId,
        ClassUnitService $classUnitService,
        ServicesScheduleCandidateBuilderService $builder,
        CPSATService $solver,
        ServicesScheduleWriterService $writer
    ) {
        set_time_limit(300);

        try {

            // 🔷 STEP 1: BUILD CLASS UNITS (Curriculum Engine replacement)
            $sections = Section::all();
            $classUnits = $classUnitService->generate($sections);

            if (empty($classUnits)) {
                return back()->with('error', 'No class units generated');
            }

            $finalSchedule = [];

            // 🔷 STEP 2–3: PROCESS PER SECTION GROUP
            $grouped = collect($classUnits)->groupBy('section_id');

            foreach ($grouped as $sectionId => $units) {

                $sectionData = [
                    'section_id' => $sectionId,
                    'subject_load' => $units->values()->all(),
                ];

                // STEP 2: Build candidates
                $candidates = $builder->build(
                    (object) $sectionData,
                    collect($sectionData['subject_load'])
                );

                if (empty($candidates)) {
                    continue;
                }

                // STEP 3: CP-SAT SOLVER
                $optimized = $solver->solve($candidates);

                if (!empty($optimized)) {
                    $finalSchedule = array_merge($finalSchedule, $optimized);
                }
            }

            // 🔷 STEP 4: SAVE FINAL SCHEDULE
            $writer->save($finalSchedule, $versionId, 'A');

            return redirect()
                ->route('schedules.index')
                ->with('success', 'Schedule generated successfully');

        } catch (\Exception $e) {

            return back()->with('error', 'Generation failed: ' . $e->getMessage());
        }
    }
}