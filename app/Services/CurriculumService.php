<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Curriculum;
use App\Models\Subject;

class CurriculumService
{
    /**
     * FETCH SUBJECTS FOR SECTION
     */
    public function fetch($sectionId)
    {
        // get section
        $section = Section::findOrFail($sectionId);

        // get curriculum mapping
        $curriculum = Curriculum::where('program_id', $section->program_id)
            ->where('year_level', $section->year_level)
            ->where('semester', $section->semester)
            ->get();

        $result = [];

        foreach ($curriculum as $item) {

            $subject = Subject::find($item->subject_id);

            if (!$subject) continue;

            // 🚫 STRICT RULE: MAJOR SUBJECT PROGRAM LIMIT
            if (
                $subject->type === 'Major' &&
                $subject->program_id != $section->program_id
            ) {
                continue;
            }

            $result[] = [
                'subject_id' => $subject->id,
                'type' => $subject->type,
                'program_id' => $subject->program_id,
                'year_level' => $section->year_level,
                'semester' => $section->semester,
            ];
        }

        return $result;
    }
}
