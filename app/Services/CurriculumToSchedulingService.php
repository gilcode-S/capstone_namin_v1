<?php

namespace App\Services;

use App\Models\Curriculum;
use App\Models\SchedulingUnit;

class CurriculumToSchedulingService
{
    // MAIN FUNCTION
    public function generateSchedulingUnits($sectionId)
    {
        // GET ALL SUBJECTS FROM CURRICULUM
        $subjects = Curriculum::where('section_id', $sectionId)->get();

        foreach ($subjects as $subject) {

            // GET NUMBER OF UNITS (1,2,3)
            $units = $subject->units;

            // GET PREFERENCES FROM SUBJECT
            $preferredTeacher = $subject->preferred_teacher_id ?? null;
            $preferredDay = $subject->preferred_day ?? null;
            $preferredShift = $subject->preferred_shift ?? null;

            // ----------------------------------
            // CASE 1: 3 UNITS → SPLIT INTO 2H + 1H
            // ----------------------------------
            if ($units == 3) {

                // CREATE 2-HOUR BLOCK
                SchedulingUnit::create([
                    'section_id' => $sectionId, // section
                    'subject_id' => $subject->subject_id, // subject
                    'faculty_id' => $preferredTeacher, // optional teacher
                    'duration_hours' => 2, // 2-hour block
                    'meeting_group' => $subject->subject_id, // same group
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);

                // CREATE 1-HOUR BLOCK
                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subject->subject_id,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 1, // 1-hour block
                    'meeting_group' => $subject->subject_id,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            }

            // ----------------------------------
            // CASE 2: 2 UNITS → SINGLE 2H BLOCK
            // ----------------------------------
            elseif ($units == 2) {

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subject->subject_id,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 2,
                    'meeting_group' => $subject->subject_id,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            }

            // ----------------------------------
            // CASE 3: 1 UNIT → SINGLE 1H
            // ----------------------------------
            else {

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subject->subject_id,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 1,
                    'meeting_group' => $subject->subject_id,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            }
        }
    }
}
