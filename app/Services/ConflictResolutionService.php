<?php

namespace App\Services;

use App\Models\Conflict;
use App\Models\Schedule;
use App\Models\Room;

class ConflictResolutionService
{
    public function resolveAll($versionId)
    {
        $conflicts = Conflict::where('version_id', $versionId)
            ->where('resolved', false)
            ->get();

        foreach ($conflicts as $conflict) {

            match ($conflict->type) {

                'teacher_overlap' => $this->fixTeacherOverlap($conflict),
                'room_conflict' => $this->fixRoomConflict($conflict),
                'section_overlap' => $this->fixSectionOverlap($conflict),

                default => $this->markManual($conflict)
            };
        }
    }

    /**
     * FIX TEACHER OVERLAP
     */
    private function fixTeacherOverlap($conflict)
    {
        $meta = json_decode($conflict->meta, true);

        $schedule = Schedule::find($meta['schedule_b']);

        // move to another timeslot safely
        $newSlot = Schedule::where('timeslot_id', '!=', $schedule->timeslot_id)
            ->where('teacher_id', '!=', $schedule->teacher_id)
            ->first();

        if ($newSlot) {
            $schedule->timeslot_id = $newSlot->timeslot_id;
            $schedule->save();

            $conflict->resolved = true;
            $conflict->resolution_type = 'auto';
            $conflict->save();
        }
    }

    /**
     * FIX ROOM CONFLICT (RESPECT ROOM TYPE)
     */
    private function fixRoomConflict($conflict)
    {
        $meta = json_decode($conflict->meta, true);

        $schedule = Schedule::find($meta['schedule_b']);

        // skip if ONLINE
        if ($schedule->is_online) return;

        $newRoom = Room::where('id', '!=', $schedule->room_id)->first();

        if ($newRoom) {
            $schedule->room_id = $newRoom->id;
            $schedule->save();

            $conflict->resolved = true;
            $conflict->resolution_type = 'auto';
            $conflict->save();
        }
    }

    /**
     * FIX SECTION OVERLAP
     */
    private function fixSectionOverlap($conflict)
    {
        // safer: mark manual (avoid breaking schedule)
        $this->markManual($conflict);
    }

    /**
     * MARK FOR MANUAL REVIEW
     */
    private function markManual($conflict)
    {
        $conflict->resolution_type = 'manual';
        $conflict->save();
    }
}


