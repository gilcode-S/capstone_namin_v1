<?php

namespace App\Services;

class ScheduleOptimizerService
{
    public function optimize($candidates)
    {
        // STEP 1: SORT BY SCORE
        usort($candidates, fn($a, $b) => $b['score'] <=> $a['score']);

        $final = [];

        // 🔥 TRACK ALL CONFLICTS
        $usedRoomSlots = [];
        $usedTeacherSlots = [];
        $usedSectionSlots = [];

        foreach ($candidates as $candidate) {

            $slot = $candidate['timeslot_id'];

            $roomKey = $slot . '-' . $candidate['room_id'];
            $teacherKey = $slot . '-' . $candidate['teacher_id'];
            $sectionKey = $slot . '-' . $candidate['section_id'];

            // ❌ ROOM CONFLICT
            if (isset($usedRoomSlots[$roomKey])) continue;

            // ❌ TEACHER CONFLICT
            if (isset($usedTeacherSlots[$teacherKey])) continue;

            // ❌ SECTION CONFLICT
            if (isset($usedSectionSlots[$sectionKey])) continue;

            // ACCEPT SCHEDULE
            $usedRoomSlots[$roomKey] = true;
            $usedTeacherSlots[$teacherKey] = true;
            $usedSectionSlots[$sectionKey] = true;

            $final[] = $candidate;
        }

        return $final;
    }
}
