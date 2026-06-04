<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Timeslot;
use App\Models\CurriculumSubject;
use Illuminate\Support\Facades\DB;

class ScheduleGeneratorService
{
    /**
     * RANK TEACHERS
     */
    public function rankTeachersForSubject(
        Subject $subject,
        Section $section,
        $versionId,
        $teacherLoads
    ) {

        /**
         * HARD CONSTRAINT:
         * REQUIRED TEACHER
         */
        if ($subject->req_teacher_id) {

            $teachers = Teacher::where(
                'id',
                $subject->req_teacher_id
            )->get();
        }

        /**
         * NORMAL LOGIC
         */
        else {

            $teachers = Teacher::all();
        }

        $rankedTeachers = [];

        foreach ($teachers as $teacher) {

            $score = 0;

            $isQualified = false;

            /**
             * MAJOR SUBJECTS
             */
            if ($subject->type === 'Major') {

                if (
                    $subject->program &&
                    $teacher->department_id ===
                    $subject->program->department_id
                ) {

                    $score += 50;

                    $isQualified = true;
                }
            }

            /**
             * MINOR SUBJECTS
             */
            else {

                if (
                    $teacher->domainGroup &&
                    $teacher->domainGroup->domains->contains(
                        'id',
                        $subject->domain_id
                    )
                ) {

                    $score += 40;

                    $isQualified = true;
                }
            }

            /**
             * SHIFT PREFERENCE
             */
            $teacherShifts =
                $teacher->shift_preferences ?? [];

            if (
                in_array(
                    $section->shift,
                    $teacherShifts
                )
            ) {

                $score += 20;
            }

            /**
             * SKIP UNQUALIFIED
             */
            if (!$isQualified) {
                continue;
            }

            /**
             * LOAD BALANCING
             */
            $currentLoad =
                $teacherLoads[$teacher->id] ?? 0;

            $maxHours =
                $teacher->max_hours ?? 30;

            /**
             * SKIP OVERLOADED
             */
            if ($currentLoad >= $maxHours) {
                logger()->info('Teacher Full', [
                    'teacher' => $teacher->name,
                    'load' => $currentLoad,
                    'max' => $maxHours,
                ]);
                continue;
            }

            /**
             * LOWER LOAD = HIGHER SCORE
             */
            $score += max(0, 30 - $currentLoad);

            $rankedTeachers[] = [
                'teacher' => $teacher,
                'score' => $score,
                'load' => $currentLoad,
            ];
        }

        /**
         * SORT BY:
         * 1. SCORE DESC
         * 2. LOAD ASC
         */
        usort($rankedTeachers, function ($a, $b) {

            if ($a['score'] === $b['score']) {
                return $a['load'] <=> $b['load'];
            }

            return $b['score'] <=> $a['score'];
        });

        return collect($rankedTeachers)
            ->pluck('teacher');
    }

    /**
     * MAIN GENERATOR
     */
    public function generateScheduleForSection(
        Section $section,
        $versionId,
        $semester
    ) {

        DB::beginTransaction();

        try {

            /**
             * IN-MEMORY TEACHER LOAD TRACKER
             */
            $teacherLoads = [];

            foreach (Teacher::all() as $teacher) {

                $teacherLoads[$teacher->id] =
                    DB::table('schedules')
                    ->where(
                        'schedule_version_id',
                        $versionId
                    )
                    ->where(
                        'teacher_id',
                        $teacher->id
                    )
                    ->count();
            }

            /**
             * CURRICULUM SUBJECTS
             */
            $curriculumSubjects =
                CurriculumSubject::where(
                    'program_id',
                    $section->program_id
                )
                ->where(
                    'year_level',
                    $section->year_level
                )
                ->where(
                    'semester',
                    $semester
                )
                ->with('subject.program')
                ->get();

            if ($curriculumSubjects->isEmpty()) {
                return false;
            }

            /**
             * AVAILABLE TIMESLOTS
             */
            $defaultGenerationDays = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];

            $availableTimeslots = Timeslot::where(
                'shift',
                $section->shift
            )
                ->whereIn('day', $defaultGenerationDays)
                ->get();

            /**
             * AVAILABLE ROOMS
             */
            $rooms = Room::where(
                'type',
                '!=',
                'Online'
            )->get();

            /**
             * START SCHEDULING
             */
            foreach ($curriculumSubjects as $curriculum) {

                $subject = $curriculum->subject;

                if (!$subject) {
                    continue;
                }

                $unitsToSchedule =
                    $subject->units;

                /**
                 * GET RANKED TEACHERS
                 */
                $rankedTeachers =
                    $this->rankTeachersForSubject(
                        $subject,
                        $section,
                        $versionId,
                        $teacherLoads
                    );

                if ($rankedTeachers->isEmpty()) {

                    throw new \Exception(
                        "No qualified teacher found for {$subject->name}"
                    );
                }

                $success = false;
                /**
                 * SUBJECT-SPECIFIC TIMESLOTS
                 */
                $subjectTimeslots = $availableTimeslots;

                /**
                 * ALLOW SPECIAL DAYS (EX: SUNDAY)
                 */
                if ($subject->req_day) {

                    $subjectTimeslots = Timeslot::where(
                        'shift',
                        $section->shift
                    )
                        ->where('day', $subject->req_day)
                        ->get();
                }

                /**
                 * TRY TEACHERS
                 */
                foreach ($rankedTeachers as $teacher) {
                    logger()->info('Trying Teacher', [
                        'subject' => $subject->name,
                        'teacher' => $teacher->name,
                    ]);

                    $tempSchedules = [];

                    $scheduledUnits = 0;

                    $tempLoadAdded = 0;

                    /**
                     * SHUFFLE TIMESLOTS
                     */
                    foreach (
                        $subjectTimeslots->shuffle()
                        as $timeslot
                    ) {

                        /**
                         * DONE
                         */
                        if (
                            $scheduledUnits >=
                            $unitsToSchedule
                        ) {

                            break;
                        }

                        /**
                         * HARD CONSTRAINT:
                         * REQUIRED DAY
                         */
                        if ($subject->req_day) {

                            if ($timeslot->day !== $subject->req_day) {
                                continue;
                            }
                        }

                        /**
                         * CONFLICT CHECK
                         */
                        if (
                            $this->hasConflict(
                                $timeslot->id,
                                $teacher->id,
                                $section->id,
                                $versionId
                            )


                        ) {
                            logger()->info('Conflict', [
                                'subject' => $subject->name,
                                'teacher' => $teacher->name,
                                'timeslot' => $timeslot->id,
                            ]);
                            continue;
                        }

                        /**
                         * REAL-TIME LOAD CHECK
                         */
                        $currentLoad =
                            $teacherLoads[$teacher->id];

                        $maxHours =
                            $teacher->max_hours ?? 30;

                        if (
                            $currentLoad >=
                            $maxHours
                        ) {
                            continue;
                        }

                        /**
                         * ROOM CHECK
                         */
                        $room =
                            $this->findAvailableRoom(
                                $timeslot->id,
                                $rooms,
                                $subject,
                                $versionId
                            );

                        if (!$room) {
                            logger()->info('No Room', [
                                'subject' => $subject->name,
                                'timeslot' => $timeslot->id,
                            ]);
                            continue;
                        }

                        /**
                         * TEMP STORE
                         */
                        $tempSchedules[] = [
                            'schedule_version_id' =>
                            $versionId,

                            'section_id' =>
                            $section->id,

                            'subject_id' =>
                            $subject->id,

                            'teacher_id' =>
                            $teacher->id,

                            'room_id' =>
                            $room->id,

                            'timeslot_id' =>
                            $timeslot->id,

                            'created_at' => now(),

                            'updated_at' => now(),
                        ];

                        /**
                         * UPDATE COUNTERS
                         */
                        $scheduledUnits++;

                        $teacherLoads[$teacher->id]++;

                        $tempLoadAdded++;
                    }

                    /**
                     * SUCCESS
                     */
                    if (
                        $scheduledUnits >=
                        $unitsToSchedule
                    ) {

                        DB::table('schedules')
                            ->insert($tempSchedules);

                        $success = true;

                        break;
                    }

                    /**
                     * ROLLBACK TEMP LOADS
                     */
                    $teacherLoads[$teacher->id] -=
                        $tempLoadAdded;
                }

                /**
                 * FAILED
                 */
                /**
                 * FAILED
                 */
                /**
                 * FAILED
                 */
                if (!$success) {

                    $requiredRoom = null;
                    $requiredTeacher = null;
                    $requiredDay = $subject->req_day;

                    /**
                     * REQUIRED TEACHER
                     */
                    if ($subject->req_teacher_id) {

                        $requiredTeacher =
                            Teacher::find($subject->req_teacher_id);
                    }

                    /**
                     * REQUIRED ROOM
                     */
                    if ($subject->req_room_id) {

                        $requiredRoom =
                            Room::find($subject->req_room_id);
                    }

                    logger()->warning('Debug Schedule Failure', [
                        'subject' => $subject->name,
                        'units' => $unitsToSchedule,
                        'ranked_teachers' => $rankedTeachers->count(),
                        'available_timeslots' => $subjectTimeslots->count(),
                    ]);

                    /**
                     * ALL HARD CONSTRAINTS FAILED
                     */
                    if (
                        $requiredTeacher &&
                        $requiredDay &&
                        $requiredRoom
                    ) {

                        throw new \Exception(
                            "Could not schedule {$subject->name} because required teacher {$requiredTeacher->name}, required room {$requiredRoom->generated_name}, and {$requiredDay} timeslot are unavailable."
                        );
                    }

                    /**
                     * REQUIRED TEACHER FAILED
                     */
                    if ($requiredTeacher) {

                        throw new \Exception(
                            "Could not schedule {$subject->name} because required teacher {$requiredTeacher->name} has no available timeslot."
                        );
                    }

                    /**
                     * REQUIRED DAY FAILED
                     */
                    if ($requiredDay) {

                        throw new \Exception(
                            "Could not schedule {$subject->name} because no available {$requiredDay} timeslot exists."
                        );
                    }

                    /**
                     * REQUIRED ROOM FAILED
                     */
                    if ($requiredRoom) {

                        throw new \Exception(
                            "Could not schedule {$subject->name} because required room {$requiredRoom->generated_name} is unavailable."
                        );
                    }

                    throw new \Exception(
                        "Could not fully schedule {$subject->name}"
                    );
                }
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {

            DB::rollBack();

            throw $e;
        }
    }

    /**
     * CONFLICT CHECKER
     */
    private function hasConflict(
        $timeslotId,
        $teacherId,
        $sectionId,
        $versionId
    ) {

        return DB::table('schedules')
            ->where(
                'schedule_version_id',
                $versionId
            )
            ->where(
                'timeslot_id',
                $timeslotId
            )
            ->where(function ($query)
            use (
                $teacherId,
                $sectionId
            ) {

                $query->where(
                    'teacher_id',
                    $teacherId
                )
                    ->orWhere(
                        'section_id',
                        $sectionId
                    );
            })
            ->exists();
    }

    public function generateSingleSubject(
        Section $section,
        Subject $subject,
        $versionId
    ) {

        DB::beginTransaction();

        try {

            /**
             * IN-MEMORY TEACHER LOAD TRACKER
             */
            $teacherLoads = [];

            foreach (Teacher::all() as $teacher) {

                $teacherLoads[$teacher->id] =
                    DB::table('schedules')
                    ->where(
                        'schedule_version_id',
                        $versionId
                    )
                    ->where(
                        'teacher_id',
                        $teacher->id
                    )
                    ->count();
            }

            /**
             * AVAILABLE TIMESLOTS
             */
            $defaultGenerationDays = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];

            $availableTimeslots = Timeslot::where(
                'shift',
                $section->shift
            )
                ->whereIn('day', $defaultGenerationDays)
                ->get();

            /**
             * AVAILABLE ROOMS
             */
            $rooms = Room::where(
                'type',
                '!=',
                'Online'
            )->get();

            $unitsToSchedule =
                $subject->units;

            /**
             * GET RANKED TEACHERS
             */
            $rankedTeachers =
                $this->rankTeachersForSubject(
                    $subject,
                    $section,
                    $versionId,
                    $teacherLoads
                );

            if ($rankedTeachers->isEmpty()) {

                throw new \Exception(
                    "No qualified teacher found for {$subject->name}"
                );
            }

            $success = false;

            /**
             * SUBJECT-SPECIFIC TIMESLOTS
             */
            $subjectTimeslots = $availableTimeslots;

            if ($subject->req_day) {

                $subjectTimeslots = Timeslot::where(
                    'shift',
                    $section->shift
                )
                    ->where(
                        'day',
                        $subject->req_day
                    )
                    ->get();
            }

            foreach ($rankedTeachers as $teacher) {

                $tempSchedules = [];

                $scheduledUnits = 0;

                $tempLoadAdded = 0;

                foreach (
                    $subjectTimeslots->shuffle()
                    as $timeslot
                ) {

                    if (
                        $scheduledUnits >=
                        $unitsToSchedule
                    ) {
                        break;
                    }

                    if ($subject->req_day) {

                        if (
                            $timeslot->day !==
                            $subject->req_day
                        ) {
                            continue;
                        }
                    }

                    if (
                        $this->hasConflict(
                            $timeslot->id,
                            $teacher->id,
                            $section->id,
                            $versionId
                        )
                    ) {
                        continue;
                    }

                    $currentLoad =
                        $teacherLoads[$teacher->id];

                    $maxHours =
                        $teacher->max_hours ?? 30;

                    if (
                        $currentLoad >=
                        $maxHours
                    ) {
                        continue;
                    }

                    $room =
                        $this->findAvailableRoom(
                            $timeslot->id,
                            $rooms,
                            $subject,
                            $versionId
                        );

                    if (!$room) {
                        continue;
                    }

                    $tempSchedules[] = [
                        'schedule_version_id' =>
                        $versionId,

                        'section_id' =>
                        $section->id,

                        'subject_id' =>
                        $subject->id,

                        'teacher_id' =>
                        $teacher->id,

                        'room_id' =>
                        $room->id,

                        'timeslot_id' =>
                        $timeslot->id,

                        'created_at' => now(),

                        'updated_at' => now(),
                    ];

                    $scheduledUnits++;

                    $teacherLoads[$teacher->id]++;

                    $tempLoadAdded++;
                }

                if (
                    $scheduledUnits >=
                    $unitsToSchedule
                ) {

                    DB::table('schedules')
                        ->insert($tempSchedules);

                    $success = true;

                    break;
                }

                $teacherLoads[$teacher->id] -=
                    $tempLoadAdded;
            }

            if (!$success) {

                throw new \Exception(
                    "Could not fully schedule {$subject->name}"
                );
            }

            DB::commit();

            return true;
        } catch (\Exception $e) {

            DB::rollBack();

            throw $e;
        }
    }
    /**
     * ROOM FINDER
     */
    private function findAvailableRoom(
        $timeslotId,
        $rooms,
        $subject,
        $versionId
    ) {

        $bookedRooms =
            DB::table('schedules')
            ->where(
                'schedule_version_id',
                $versionId
            )
            ->where(
                'timeslot_id',
                $timeslotId
            )
            ->pluck('room_id')
            ->toArray();

        foreach ($rooms as $room) {
            /**
             * HARD CONSTRAINT:
             * REQUIRED ROOM
             */
            if ($subject->req_room_id) {

                if ($room->id != $subject->req_room_id) {
                    continue;
                }
            }

            /**
             * ROOM TAKEN
             */
            if (
                in_array(
                    $room->id,
                    $bookedRooms
                )
            ) {
                continue;
            }

            /**
             * PE ROOM REQUIREMENT
             */
            if (
                str_contains(
                    strtolower($subject->name),
                    'pe'
                ) &&
                $room->type !== 'PE'
            ) {
                continue;
            }

            /**
             * LAB ROOM REQUIREMENT
             */
            if (
                (
                    str_contains(
                        strtolower($subject->name),
                        'programming'
                    ) 
                    // ||
                    // str_contains(
                    //     strtolower($subject->name),
                    //     'computer'
                    // )
                ) &&
                $room->type !== 'Lab'
            ) {
                continue;
            }

            return $room;
        }

        return null;
    }
}
