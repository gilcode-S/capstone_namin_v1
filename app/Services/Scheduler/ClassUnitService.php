<?php

namespace App\Services\Scheduler;

use App\Models\Curriculum;
use App\Models\Section;

class ClassUnitService
{
    public function generate($sections)
    {
        $classUnits = [];

        foreach ($sections as $section) {

            $curriculum = Curriculum::with('subject')
                ->where('program_id', $section->program_id)
                ->where('year_level', $section->year_level)
                ->where('semester', $section->semester_id)
                ->get();

            foreach ($curriculum as $item) {

                $subject = $item->subject;
                if (!$subject) continue;

                $units = max(1, $subject->units ?? 3);

                $classUnits[] = [
                    "section_id" => $section->id,
                    "subject_id" => $subject->id,
                    "subject_name" => $subject->subject_name,

                    "room_type" => $subject->room_type ?? 'classroom',

                    "sessions_needed" => $units,

                    "preferred_shift" => $subject->preferred_shift,
                ];
            }
        }

        return $classUnits;
    }
}
