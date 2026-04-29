<?php

namespace App\Services;

use App\Models\ClassUnit;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Services\DomainScoringService;
use App\Services\SectionCapacityBalancerService;

class CPSATSchedulerService
{
    protected $scoring;

    /**
     * Track teacher load
     */
    protected $teacherLoad = [];

    protected $sectionBalancer;

    public function __construct(
        DomainScoringService $scoring,
        SectionCapacityBalancerService $sectionBalancer
    ) {
        $this->scoring = $scoring;
        $this->sectionBalancer = $sectionBalancer;
    }

    /**
     * ==========================================
     * MAIN ENTRY POINT
     * ==========================================
     */
    public function generateSchedule($versionId)
    {
        logger()->debug("Starting CP-SAT for version ID: {$versionId}");

        $units = ClassUnit::with([
                'subject',
                'section'
            ])
            ->where('status', 'generated')
            ->get();

        $teachers = Faculty::all();
        $rooms = Room::all();
        $timeslots = TimeSlot::all();

        if (
            $units->isEmpty() ||
            $teachers->isEmpty() ||
            $rooms->isEmpty() ||
            $timeslots->isEmpty()
        ) {
            throw new \Exception("Missing required scheduling data.");
        }

        /**
         * ==========================================
         * STEP 1 — SECTION CAPACITY BALANCER
         * ==========================================
         */
        $units = $this->sectionBalancer->balance(
            $units,
            $timeslots
        );

        logger()->debug("Balanced units count", [
            'units' => $units->count()
        ]);

        /**
         * ==========================================
         * STEP 2 — TEACHER ROUTING + LOAD BALANCE
         * ==========================================
         */
        $units = $this->assignTeachersWithLoadBalancing(
            $units,
            $teachers
        );

        /**
         * ==========================================
         * STEP 3 — BUILD SOLVER PAYLOAD
         * ==========================================
         */
        $data = $this->prepareSolverData(
            $units,
            $rooms,
            $timeslots
        );

        /**
         * ==========================================
         * STEP 4 — RUN PYTHON
         * ==========================================
         */
        $result = $this->runPythonSolver($data);

        /**
         * ==========================================
         * STEP 5 — FALLBACK IF NO SOLUTION
         * ==========================================
         */
        if (!$result || count($result) === 0) {

            logger()->warning(
                "CP-SAT returned empty result. Using fallback greedy scheduler."
            );

            $result = $this->fallbackGreedySchedule(
                $units,
                $rooms,
                $timeslots
            );

            logger()->debug("Fallback generated schedules", [
                'count' => count($result)
            ]);
        }

        /**
         * ==========================================
         * STEP 6 — SAVE
         * ==========================================
         */
        return $this->saveScheduleFromPython(
            $result,
            $versionId,
            $units
        );
    }

    /**
     * ==========================================
     * SUBJECT TYPE DETECTOR
     * ==========================================
     */
    private function isMajorSubject($subject)
    {
        $code = strtoupper($subject->subject_code ?? '');

        $majorPrefixes = [
            'CC',
            'CS',
            'IT',
            'SE',
            'DS',
            'IAS',
            'NET',
            'DB',
            'CAP',
            'THS',
            'PRC'
        ];

        foreach ($majorPrefixes as $prefix) {
            if (str_starts_with($code, $prefix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * ==========================================
     * TEACHER ELIGIBILITY FILTER
     * ==========================================
     */
    private function getEligibleTeachers($teachers, $unit)
    {
        $yearLevel = $unit->section->year_level ?? 1;

        $isMajor = $this->isMajorSubject(
            $unit->subject
        );

        return $teachers->filter(
            function ($teacher) use (
                $yearLevel,
                $isMajor
            ) {

                $specialization = strtolower(
                    $teacher->specialization ?? ''
                );

                /**
                 * 1ST–2ND YEAR
                 */
                if ($yearLevel <= 2) {

                    return (
                        str_contains($specialization, 'general') ||
                        str_contains($specialization, 'foundation') ||
                        str_contains($specialization, 'programming') ||
                        str_contains($specialization, 'mathematics')
                    );
                }

                /**
                 * 3RD–4TH YEAR MAJOR
                 */
                if (
                    $yearLevel >= 3 &&
                    $isMajor
                ) {

                    return (
                        str_contains($specialization, 'software') ||
                        str_contains($specialization, 'database') ||
                        str_contains($specialization, 'network') ||
                        str_contains($specialization, 'security') ||
                        str_contains($specialization, 'computer science')
                    );
                }

                return true;
            }
        )->values();
    }

    /**
     * ==========================================
     * TEACHER LOAD BALANCER
     * ==========================================
     */
    private function assignTeachersWithLoadBalancing(
        $units,
        $teachers
    ) {
        $this->teacherLoad = [];

        foreach ($teachers as $teacher) {
            $this->teacherLoad[$teacher->id] = 0;
        }

        /**
         * Dynamic max load
         */
        $maxLoad = ceil(
            count($units) / max(1, count($teachers))
        ) + 2;

        foreach ($units as $unit) {

            $eligibleTeachers =
                $this->getEligibleTeachers(
                    $teachers,
                    $unit
                );

            if ($eligibleTeachers->isEmpty()) {
                $eligibleTeachers = $teachers;
            }

            $candidates = [];

            foreach ($eligibleTeachers as $teacher) {

                /**
                 * Hard load cap
                 */
                if (
                    $this->teacherLoad[$teacher->id]
                    >= $maxLoad
                ) {
                    continue;
                }

                $score =
                    $this->scoring
                    ->calculateTeacherScore(
                        $teacher,
                        $unit->subject
                    );

                /**
                 * Penalize overload
                 */
                $loadPenalty =
                    $this->teacherLoad[$teacher->id]
                    * 0.05;

                /**
                 * Senior year bonus
                 */
                $yearLevel =
                    $unit->section->year_level ?? 1;

                $seniorBonus = 0;

                if (
                    $yearLevel >= 4 &&
                    (
                        str_contains(
                            strtolower(
                                $teacher->specialization ?? ''
                            ),
                            'software'
                        ) ||
                        str_contains(
                            strtolower(
                                $teacher->specialization ?? ''
                            ),
                            'computer science'
                        )
                    )
                ) {
                    $seniorBonus = 0.15;
                }

                $finalScore =
                    $score -
                    $loadPenalty +
                    $seniorBonus;

                $candidates[] = [
                    'teacher' => $teacher,
                    'score' => $finalScore
                ];
            }

            /**
             * Fallback if all capped
             */
            if (empty($candidates)) {

                foreach ($teachers as $teacher) {

                    $score =
                        $this->scoring
                        ->calculateTeacherScore(
                            $teacher,
                            $unit->subject
                        );

                    $candidates[] = [
                        'teacher' => $teacher,
                        'score' => $score
                    ];
                }
            }

            usort(
                $candidates,
                fn($a, $b) =>
                $b['score'] <=> $a['score']
            );

            /**
             * Top 3 randomized
             */
            $top = array_slice(
                $candidates,
                0,
                3
            );

            $selected =
                $top[array_rand($top)];

            $teacher =
                $selected['teacher'];

            $unit->assigned_teacher_id =
                $teacher->id;

            $this->teacherLoad[
                $teacher->id
            ]++;
        }

        logger()->debug(
            "Teacher workload distribution",
            [
                'loads' => $this->teacherLoad,
                'max_load' => $maxLoad
            ]
        );

        return $units;
    }

    /**
     * ==========================================
     * SOLVER PAYLOAD
     * ==========================================
     */
    public function prepareSolverData(
        $units,
        $rooms,
        $timeslots
    ) {
        return [
            'class_units' => $units->map(
                function ($u) {

                    $constraints =
                        json_decode(
                            $u->constraints,
                            true
                        );

                    $yearLevel =
                        $u->section->year_level ?? 1;

                    /**
                     * 4TH YEAR PREFERS EVENING
                     * but fallback to curriculum
                     */
                    $preferredShift =
                        $yearLevel >= 4
                        ? (
                            $constraints['preferred_shift']
                            ?? 'evening'
                        )
                        : (
                            $constraints['preferred_shift']
                            ?? null
                        );

                    return [
                        'id' => $u->id,
                        'section_id' => $u->section_id,
                        'teacher_id' => $u->assigned_teacher_id,
                        'set_type' => $u->set_type ?? 'A',
                        'preferred_shift' => $preferredShift,
                    ];
                }
            )->values()->toArray(),

            'rooms' => $rooms->map(
                fn($r) => [
                    'id' => $r->id,
                ]
            )->values()->toArray(),

            'timeslots' => $timeslots->map(
                fn($ts) => [
                    'id' => $ts->id,
                    'shift' => $ts->shift ?? null,
                ]
            )->values()->toArray(),
        ];
    }

    /**
     * ==========================================
     * FALLBACK GREEDY SCHEDULER
     * ==========================================
     */
    private function fallbackGreedySchedule(
        $units,
        $rooms,
        $timeslots
    ) {
        $result = [];

        $usedRoomTimeslot = [];
        $usedSectionTimeslot = [];
        $usedTeacherTimeslot = [];

        foreach ($units as $unit) {

            foreach ($timeslots as $timeslot) {

                /**
                 * Respect preferred shift
                 */
                if (
                    !empty($unit->preferred_shift) &&
                    $timeslot->shift !==
                    $unit->preferred_shift
                ) {
                    continue;
                }

                foreach ($rooms as $room) {

                    $roomKey =
                        $room->id .
                        '_' .
                        $timeslot->id;

                    $sectionKey =
                        $unit->section_id .
                        '_' .
                        $timeslot->id;

                    $teacherKey =
                        $unit->assigned_teacher_id .
                        '_' .
                        $timeslot->id;

                    if (
                        isset($usedRoomTimeslot[$roomKey]) ||
                        isset($usedSectionTimeslot[$sectionKey]) ||
                        isset($usedTeacherTimeslot[$teacherKey])
                    ) {
                        continue;
                    }

                    $usedRoomTimeslot[$roomKey] = true;
                    $usedSectionTimeslot[$sectionKey] = true;
                    $usedTeacherTimeslot[$teacherKey] = true;

                    $result[] = [
                        "unit_id" => $unit->id,
                        "room_id" => $room->id,
                        "timeslot_id" => $timeslot->id
                    ];

                    break 2;
                }
            }
        }

        return $result;
    }

    /**
     * ==========================================
     * PYTHON RUNNER
     * ==========================================
     */
    private function runPythonSolver($data)
    {
        $json = json_encode($data);

        if (!$json) {
            throw new \Exception(
                "Failed to encode payload"
            );
        }

        $inputFile =
            storage_path(
                'app/cp_sat_input.json'
            );

        file_put_contents(
            $inputFile,
            $json
        );

        $pythonPath = "python";

        $solverPath = base_path(
            'python_engine/cp_sat_solver.py'
        );

        $command =
            $pythonPath . " " .
            escapeshellarg($solverPath) . " " .
            escapeshellarg($inputFile) . " 2>&1";

        logger()->debug(
            "Running command: " . $command
        );

        $output = shell_exec($command);

        logger()->debug(
            "Python raw output: " . $output
        );

        if (!$output) {
            throw new \Exception(
                "Python solver returned empty output"
            );
        }

        $decoded = json_decode(
            $output,
            true
        );

        if (!$decoded) {
            throw new \Exception(
                "Invalid JSON from Python: " .
                $output
            );
        }

        if (isset($decoded['error'])) {
            throw new \Exception(
                "Python Error: " .
                $decoded['error']
            );
        }

        logger()->debug(
            "CP-SAT solved successfully",
            [
                'result_count' =>
                    count(
                        $decoded['result']
                        ?? []
                    ),
                'debug' =>
                    $decoded['debug']
                    ?? []
            ]
        );

        return $decoded['result'] ?? [];
    }

    /**
     * ==========================================
     * SAVE SCHEDULE
     * ==========================================
     */
    public function saveScheduleFromPython(
        $result,
        $versionId,
        $units
    ) {
        if (!$result) {
            return null;
        }

        foreach ($result as $item) {

            $unit = $units->firstWhere(
                'id',
                $item['unit_id']
            );

            if (!$unit) {
                logger()->warning(
                    "Missing class unit",
                    [
                        'unit_id' =>
                            $item['unit_id']
                    ]
                );
                continue;
            }

            Schedule::create([
                'section_id' =>
                    $unit->section_id,

                'subject_id' =>
                    $unit->subject_id,

                'faculty_id' =>
                    $unit->assigned_teacher_id,

                'room_id' =>
                    $item['room_id'],

                'time_slot_id' =>
                    $item['timeslot_id'],

                'schedule_version_id' =>
                    $versionId,

                'set_type' =>
                    $unit->set_type ?? 'A',

                'score' => 1,
                'status' => 'active',
            ]);
        }

        logger()->debug(
            "Schedule successfully saved."
        );

        return true;
    }
}