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
                ->where('year', $section->year)
                ->where('semester', $section->semester)
                ->get();

            foreach ($curriculum as $item) {

                $subject = $item->subject;

                if (!$subject) continue;

                $classUnits[] = [
                    "section_id" => $section->id,
                    "program_id" => $section->program_id,
                    "year_level" => $section->year,
                    "semester" => $section->semester,

                    "subject_id" => $subject->id,
                    "subject_name" => $subject->name,

                    "domain" => $subject->domain,
                    "room_type" => $subject->room_type,

                    "is_major" => $subject->type === "Major",
                    "hours_per_week" => $subject->units,
                ];
            }
        }

        return $classUnits;
    }
}