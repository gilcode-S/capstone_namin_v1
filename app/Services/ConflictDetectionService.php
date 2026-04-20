<?php

namespace App\Services;

use App\Models\Schedule;

class ConflictDetectionService
{
    public function detect($versionId)
    {
        $schedules = Schedule::where('schedule_version_id', $versionId)->get();

        return array_merge(
            $this->detectTeacherConflicts($schedules),
            $this->detectRoomConflicts($schedules),
            $this->detectSectionConflicts($schedules),
            $this->detectWorkloadConflicts($schedules)
        );
    }

    private function detectTeacherConflicts($schedules)
    {
        $map = [];
        $conflicts = [];

        foreach ($schedules as $schedule) {
            $key = $schedule->faculty_id . '-' . $schedule->time_slot_id;

            if (isset($map[$key])) {
                $conflicts[] = [
                    'type' => 'teacher_overlap',
                    'schedule_a' => $map[$key],
                    'schedule_b' => $schedule->id,
                ];
            }

            $map[$key] = $schedule->id;
        }

        return $conflicts;
    }

    private function detectRoomConflicts($schedules)
    {
        $map = [];
        $conflicts = [];

        foreach ($schedules as $schedule) {
            $key = $schedule->room_id . '-' . $schedule->time_slot_id;

            if (isset($map[$key])) {
                $conflicts[] = [
                    'type' => 'room_conflict',
                    'schedule_a' => $map[$key],
                    'schedule_b' => $schedule->id,
                ];
            }

            $map[$key] = $schedule->id;
        }

        return $conflicts;
    }

    private function detectSectionConflicts($schedules)
    {
        $map = [];
        $conflicts = [];

        foreach ($schedules as $schedule) {
            $key = $schedule->section_id . '-' . $schedule->time_slot_id;

            if (isset($map[$key])) {
                $conflicts[] = [
                    'type' => 'section_overlap',
                    'schedule_a' => $map[$key],
                    'schedule_b' => $schedule->id,
                ];
            }

            $map[$key] = $schedule->id;
        }

        return $conflicts;
    }

    private function detectWorkloadConflicts($schedules)
    {
        $load = [];
        $conflicts = [];

        foreach ($schedules as $schedule) {
            $load[$schedule->faculty_id] =
                ($load[$schedule->faculty_id] ?? 0) + 1;
        }

        foreach ($load as $facultyId => $count) {
            if ($count > 30) {
                $conflicts[] = [
                    'type' => 'workload_exceeded',
                    'faculty_id' => $facultyId,
                ];
            }
        }

        return $conflicts;
    }
}