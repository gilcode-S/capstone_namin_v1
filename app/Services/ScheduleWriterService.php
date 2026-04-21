<?php

namespace App\Services;

use App\Models\Schedule;

class ScheduleWriterService
{
    /**
     * SAVE OPTIMIZED SCHEDULES TO DATABASE
     */
    public function save($scheduleData, $versionId, $setType)
    {
        // 🔥 CLEAN OLD DATA FIRST
        Schedule::where('schedule_version_id', $versionId)->delete();

        foreach ($scheduleData as $item) {

            // 🧠 SAFE FIELD EXTRACTION (handles CP-SAT variations)
            $sectionId = $item['section_id'] ?? null;
            $subjectId = $item['subject_id'] ?? null;

            // 🔥 IMPORTANT FIX: faculty_id vs teacher_id mismatch
            $facultyId = $item['faculty_id']
                        ?? $item['teacher_id']
                        ?? null;

            $roomId = $item['room_id'] ?? null;
            $timeSlotId = $item['timeslot_id'] ?? null;
            $score = $item['score'] ?? 0;

            // ❌ SKIP INVALID ENTRIES (prevents empty DB rows)
            if (!$sectionId || !$subjectId) {
                continue;
            }

            Schedule::create([
                'schedule_version_id' => $versionId,

                'section_id' => $sectionId,
                'subject_id' => $subjectId,

                'faculty_id' => $facultyId,

                'room_id' => $roomId,
                'time_slot_id' => $timeSlotId,

                'score' => $score,
                'status' => 'active',
            ]);
        }
    }
}