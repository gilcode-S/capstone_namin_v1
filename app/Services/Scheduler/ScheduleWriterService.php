<?php

namespace App\Services;

use App\Models\Schedule;

class ScheduleWriterService
{
    public function save($scheduleData, $versionId, $setType)
    {
        Schedule::where('schedule_version_id', $versionId)->delete();

        foreach ($scheduleData as $item) {

            Schedule::create([
                'schedule_version_id' => $versionId,

                'section_id' => $item['section_id'],
                'subject_id' => $item['subject_id'],
                'faculty_id' => $item['teacher_id'],

                'room_id' => $item['room_id'],
                'time_slot_id' => $item['timeslot_id'],

                'score' => $item['score'],
                'status' => 'active'
            ]);
        }
    }
}