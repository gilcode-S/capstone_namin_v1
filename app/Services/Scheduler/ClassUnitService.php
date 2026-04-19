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

                // ✅ FIXED HOURS
                $totalHours = ($subject->lecture_hours ?? 0)
                            + ($subject->lab_hours ?? 0);

                $classUnits[] = [
                    "section_id" => $section->id,
                    "section_name" => $section->section_name,

                    "program_id" => $section->program_id,
                    "year_level" => $section->year_level,
                    "semester" => $section->semester_id,

                    "subject_id" => $subject->id,
                    "subject_name" => $subject->subject_name,

                    // ✅ UPDATED (ARRAY SUPPORT)
                    "domains" => $subject->domains ?? [],

                    "room_type" => $subject->room_type_required,

                    "is_major" => $subject->subject_type === "major",

                    // 🔥 SCHEDULER READY
                    "total_hours" => $totalHours,
                    "sessions_needed" => $totalHours,

                    // 🔥 FUTURE CONSTRAINTS
                    "requires_lab" => $subject->lab_hours > 0,
                    "preferred_shift" => $subject->preferred_shift,
                ];
            }
        }

        return $classUnits;
    }
}