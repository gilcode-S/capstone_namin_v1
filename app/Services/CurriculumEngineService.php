<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Subject;
use App\Models\ClassUnit;
use Illuminate\Support\Facades\DB;

class CurriculumEngineService
{
    public function generateAllClassUnits(): void
    {
        ClassUnit::truncate(); // optional reset (REMOVE in production if needed)

        $sections = Section::all();

        foreach ($sections as $section) {
            $this->generateSectionUnits($section);
        }
    }

    public function generateSectionUnits(Section $section): void
    {
        $subjects = $this->getSubjectsByProgram($section->program_id);

        foreach ($subjects as $subject) {

            if (!$this->isSubjectAllowed($section, $subject)) {
                continue;
            }

            ClassUnit::create([
                'section_id' => $section->id,
                'subject_id' => $subject->id,

                'year_level' => $section->year_level ?? $section->year,
                'semester' => $section->semester,

                'domain' => $this->resolveSubjectDomain($subject),

                'units' => $subject->units,

                'room_type' => $subject->room_type ?? 'classroom',

                'constraints' => json_encode([
                    'preferred_teacher' => $subject->preferred_teacher_id,
                    'preferred_days' => $subject->preferred_day,
                    'preferred_shift' => $subject->preferred_shift,
                    'preferred_room' => $subject->preferred_room ?? null,
                    'hard_constraints' => $this->detectHardConstraints($subject),
                ]),

                'status' => 'generated'
            ]);
        }
    }

    private function getSubjectsByProgram($programId)
    {
        return Subject::where('program_id', $programId)->get();
    }

    private function isSubjectAllowed(Section $section, Subject $subject): bool
    {
        // FIX: use subject_type (based on your controller)
        if ($subject->subject_type === 'major') {
            return $subject->program_id === $section->program_id;
        }

        return true; // minors allowed globally
    }

    private function resolveSubjectDomain(Subject $subject): string
    {
        if ($subject->subject_type === 'major') {
            return $this->getProgramDomain($subject->program_id);
        }

        return $subject->domain ?? 'GENERAL';
    }

    private function getProgramDomain($programId): string
    {
        $program = DB::table('programs')
            ->join('departments', 'programs.department_id', '=', 'departments.id')
            ->where('programs.id', $programId)
            ->select('departments.name')
            ->first();

        return $program->name ?? 'GENERAL';
    }

    private function detectHardConstraints(Subject $subject): array
    {
        $constraints = [];

        if ($subject->preferred_teacher_id) {
            $constraints[] = 'HARD_TEACHER';
        }

        if ($subject->preferred_day) {
            $constraints[] = 'HARD_DAY';
        }

        if ($subject->preferred_shift) {
            $constraints[] = 'HARD_SHIFT';
        }

        if ($subject->room_type) {
            $constraints[] = 'HARD_ROOM';
        }

        return $constraints;
    }
}