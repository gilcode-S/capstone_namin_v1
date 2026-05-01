<?php

namespace App\Services;

use App\Models\SchedulingUnit; // units from step 4
use App\Models\FinalSchedule;  // final output
use App\Models\Section;        // section info

class SetScheduleService
{
    public function generate($versionId, $cpSatResult)
    {
        // --------------------------------------------------
        // LOOP ALL CP-SAT RESULTS
        // --------------------------------------------------
        foreach ($cpSatResult as $item) {

            // GET SECTION
            $section = Section::find($item['section_id']);

            // DETERMINE YEAR LEVEL
            $year = $section->year_level;

            // --------------------------------------------------
            // SET A LOGIC
            // --------------------------------------------------
            if ($year == 1) {
                // FIRST YEAR → FACE TO FACE
                $this->store($versionId, $item, 'A', false);
            } else {
                // 2ND–4TH → ONLINE
                $this->store($versionId, $item, 'A', true);
            }

            // --------------------------------------------------
            // SET B LOGIC
            // --------------------------------------------------
            if ($year == 1) {
                // FIRST YEAR → ONLINE
                $this->store($versionId, $item, 'B', true);
            } else {
                // 2ND–4TH → FACE TO FACE
                $this->store($versionId, $item, 'B', false);
            }
        }
    }

    // --------------------------------------------------
    // STORE FUNCTION
    // --------------------------------------------------
    private function store($versionId, $item, $set, $isOnline)
    {
        FinalSchedule::create([
            'schedule_version_id' => $versionId, // version tracking

            'section_id' => $item['section_id'], // section
            'subject_id' => $item['subject_id'], // subject
            'faculty_id' => $item['faculty_id'], // teacher

            // IF ONLINE → NO ROOM
            'room_id' => $isOnline ? null : $item['room_id'],

            'time_slot_id' => $item['time_slot_id'], // time

            'set_type' => $set, // A or B
            'is_online' => $isOnline // online flag
        ]);
    }
}
