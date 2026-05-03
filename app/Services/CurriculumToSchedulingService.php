<?php

namespace App\Services;

use App\Models\CurriculumSnapshot;
use App\Models\SchedulingUnit;

class CurriculumToSchedulingService
{
    // MAIN FUNCTION
    public function generateSchedulingUnits($sectionId)
    {

        SchedulingUnit::where('section_id', $sectionId)->delete();

        $snapshots = CurriculumSnapshot::where('section_id', $sectionId)->get();

        foreach ($snapshots as $snapshot) {
            $subject = \App\Models\Subject::find($snapshot->subject_id);

            $hours = $subject->hours_per_week;

            $preferredTeacher = $snapshot->preferred_teacher_id;
            $preferredDay = $snapshot->preferred_day;
            $preferredShift = $snapshot->preferred_shift;

            $subjectId = $snapshot->subject_id;

            if ($hours == 3) {

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subjectId,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 2,
                    'meeting_group' => $subjectId,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subjectId,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 1,
                    'meeting_group' => $subjectId,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            } elseif ($hours == 2) {

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subjectId,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 2,
                    'meeting_group' => $subjectId,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            } else {

                SchedulingUnit::create([
                    'section_id' => $sectionId,
                    'subject_id' => $subjectId,
                    'faculty_id' => $preferredTeacher,
                    'duration_hours' => 1,
                    'meeting_group' => $subjectId,
                    'preferred_day' => $preferredDay,
                    'preferred_shift' => $preferredShift,
                ]);
            }
        }
    }
}
