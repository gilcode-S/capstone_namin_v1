<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\Conflict;
use App\Models\Section;
use App\Models\Faculty;

class ConflictDetectionService
{
    /**
     * MAIN ENTRY POINT
     */
    public function scan($versionId)
    {
        // get all schedules for this version
        $schedules = Schedule::where('version_id', $versionId)->get();

        $conflicts = [];

        // run all detectors
        $conflicts = array_merge(
            $conflicts,
            $this->detectTeacherOverlap($schedules),
            $this->detectRoomOverlap($schedules),
            $this->detectSectionOverlap($schedules),
            $this->detectWorkloadIssues($schedules),
            $this->detectShiftViolation($schedules),
            $this->detectSundayViolation($schedules)
        );

        return $this->storeConflicts($conflicts, $versionId);
    }

    /**
     * TEACHER OVERLAP
     */
    private function detectTeacherOverlap($schedules)
    {
        $conflicts = [];

        foreach ($schedules as $a) {
            foreach ($schedules as $b) {

                // same teacher + same timeslot
                if ($a->id !== $b->id &&
                    $a->teacher_id === $b->teacher_id &&
                    $a->timeslot_id === $b->timeslot_id
                ) {
                    $conflicts[] = [
                        'type' => 'teacher_overlap',
                        'description' => 'Teacher double booked',
                        'schedule_a' => $a->id,
                        'schedule_b' => $b->id
                    ];
                }
            }
        }

        return $conflicts;
    }

    /**
     * ROOM CONFLICT (IGNORE ONLINE)
     */
    private function detectRoomOverlap($schedules)
    {
        $conflicts = [];

        foreach ($schedules as $a) {
            foreach ($schedules as $b) {

                // skip ONLINE schedules
                if ($a->is_online || $b->is_online) continue;

                if ($a->id !== $b->id &&
                    $a->room_id === $b->room_id &&
                    $a->timeslot_id === $b->timeslot_id
                ) {
                    $conflicts[] = [
                        'type' => 'room_conflict',
                        'description' => 'Room double booked',
                        'schedule_a' => $a->id,
                        'schedule_b' => $b->id
                    ];
                }
            }
        }

        return $conflicts;
    }

    /**
     * SECTION OVERLAP (VERY IMPORTANT)
     */
    private function detectSectionOverlap($schedules)
    {
        $conflicts = [];

        foreach ($schedules as $a) {
            foreach ($schedules as $b) {

                if ($a->id !== $b->id &&
                    $a->section_id === $b->section_id &&
                    $a->timeslot_id === $b->timeslot_id
                ) {
                    $conflicts[] = [
                        'type' => 'section_overlap',
                        'description' => 'Section double booked',
                        'schedule_a' => $a->id,
                        'schedule_b' => $b->id
                    ];
                }
            }
        }

        return $conflicts;
    }

    /**
     * WORKLOAD CHECK (uses teacher min/max)
     */
    private function detectWorkloadIssues($schedules)
    {
        $conflicts = [];

        $teacherLoads = [];

        foreach ($schedules as $s) {
            $teacherLoads[$s->teacher_id] =
                ($teacherLoads[$s->teacher_id] ?? 0) + 1;
        }

        foreach ($teacherLoads as $teacherId => $load) {

            $teacher = Faculty::find($teacherId);

            if ($teacher && $load > $teacher->max_load) {
                $conflicts[] = [
                    'type' => 'workload_imbalance',
                    'description' => "Teacher overloaded ($load)",
                ];
            }
        }

        return $conflicts;
    }

    /**
     * SHIFT VALIDATION
     */
    private function detectShiftViolation($schedules)
    {
        $conflicts = [];

        foreach ($schedules as $s) {

            $section = Section::find($s->section_id);

            if ($section && $section->shift !== $s->shift) {
                $conflicts[] = [
                    'type' => 'shift_violation',
                    'description' => 'Section shift mismatch',
                ];
            }
        }

        return $conflicts;
    }

    /**
     * SUNDAY RULE
     */
    private function detectSundayViolation($schedules)
    {
        $conflicts = [];

        foreach ($schedules as $s) {

            if ($s->day === 'Sunday' && !$s->is_preferred_day) {
                $conflicts[] = [
                    'type' => 'sunday_violation',
                    'description' => 'Sunday not allowed',
                ];
            }
        }

        return $conflicts;
    }

    /**
     * SAVE TO DB
     */
    private function storeConflicts($conflicts, $versionId)
    {
        foreach ($conflicts as $c) {

            Conflict::create([
                'version_id' => $versionId,
                'type' => $c['type'],
                'description' => $c['description'],
                'resolved' => false,
                'meta' => json_encode($c)
            ]);
        }

        return $conflicts;
    }
}


