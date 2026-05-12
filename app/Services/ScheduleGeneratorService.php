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

        $teachers = Teacher::all();

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
                    $section->semester
                )
                ->with('subject.program')
                ->get();

            /**
             * AVAILABLE TIMESLOTS
             */
            $availableTimeslots =
                Timeslot::where(
                    'shift',
                    $section->shift
                )->get();

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
                 * TRY TEACHERS
                 */
                foreach ($rankedTeachers as $teacher) {

                    $tempSchedules = [];

                    $scheduledUnits = 0;

                    $tempLoadAdded = 0;

                    /**
                     * SHUFFLE TIMESLOTS
                     */
                    foreach (
                        $availableTimeslots->shuffle()
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
                if (!$success) {

                    logger()->warning(
                        'Scheduling Failed',
                        [
                            'subject' =>
                                $subject->name,

                            'section_id' =>
                                $section->id,
                        ]
                    );

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
                    ) ||
                    str_contains(
                        strtolower($subject->name),
                        'computer'
                    )
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