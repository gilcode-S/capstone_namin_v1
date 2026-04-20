<?php

namespace App\Services;

use App\Models\Schedule;

class ConflictResolutionService
{
    public function resolve($conflicts)
    {
        $resolved = [];

        foreach ($conflicts as $conflict) {

            switch ($conflict['type']) {

                case 'teacher_overlap':
                    $resolved[] = $this->fixTeacherOverlap($conflict);
                    break;

                case 'room_conflict':
                    $resolved[] = $this->fixRoomConflict($conflict);
                    break;

                case 'section_overlap':
                    $resolved[] = $this->fixSectionConflict($conflict);
                    break;

                case 'workload_exceeded':
                    $resolved[] = $this->redistributeWorkload($conflict);
                    break;
            }
        }

        return $resolved;
    }

    private function fixTeacherOverlap($conflict)
    {
        $schedule = Schedule::find($conflict['schedule_b']);

        $newSlot = Schedule::where('time_slot_id', '!=', $schedule->time_slot_id)
            ->first();

        if ($newSlot) {
            $schedule->time_slot_id = $newSlot->time_slot_id;
            $schedule->save();
        }

        return $schedule;
    }

    private function fixRoomConflict($conflict)
    {
        $schedule = Schedule::find($conflict['schedule_b']);

        $newRoom = Schedule::where('room_id', '!=', $schedule->room_id)
            ->first();

        if ($newRoom) {
            $schedule->room_id = $newRoom->room_id;
            $schedule->save();
        }

        return $schedule;
    }

    private function fixSectionConflict($conflict)
    {
        $schedule = Schedule::find($conflict['schedule_b']);

        $schedule->time_slot_id = null;
        $schedule->save();

        return $schedule;
    }

    private function redistributeWorkload($conflict)
    {
        return $conflict;
    }
}