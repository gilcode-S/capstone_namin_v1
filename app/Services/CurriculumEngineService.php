<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Subject;
use App\Models\ClassUnit;
use Illuminate\Support\Facades\DB;

class CurriculumEngineService
{
    /**
     * =====================================================
     * GENERATE ALL CLASS UNITS
     * =====================================================
     */
    public function generateAllClassUnits(): void
    {
        // DEV ONLY
        ClassUnit::truncate();

        $sections = Section::all();

        foreach ($sections as $section) {
            $this->generateSectionUnits($section);
        }
    }

    /**
     * =====================================================
     * GENERATE SECTION UNITS
     * =====================================================
     */
    public function generateSectionUnits(Section $section): void
    {
        $subjects = $this->getSubjectsByProgram(
            $section->program_id,
            $section->year_level,
            $section->semester_id
        );

        foreach ($subjects as $subject) {

            if (!$this->isSubjectAllowed($section, $subject)) {
                continue;
            }

            /**
             * Example:
             * 3 hrs/week = 2 sessions
             * 4.5 hrs/week = 3 sessions
             */
            $sessionsNeeded = max(
                1,
                ceil(($subject->hours_per_week ?? 3) / 1.5)
            );

            /**
             * Create MULTIPLE class units
             * so scheduler can place each session
             */
            for ($sessionIndex = 1; $sessionIndex <= $sessionsNeeded; $sessionIndex++) {

                ClassUnit::create([
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,

                    'year_level' => $section->year_level,
                    'semester' => $section->semester_id,

                    'domain' => $this->resolveSubjectDomain($subject),

                    'units' => $subject->units ?? 3,

                    'sessions_needed' => $sessionsNeeded,
                    'session_index' => $sessionIndex,

                    'room_type' => $subject->room_type ?? 'classroom',

                    'constraints' => json_encode([
                        'preferred_teacher' => $subject->preferred_teacher_id,
                        'preferred_days' => $subject->preferred_days ?? [],
                        'preferred_shift' => $subject->preferred_shift,
                        'preferred_room' => $subject->preferred_room_id ?? null,
                        'hard_constraints' => $this->detectHardConstraints($subject),
                    ]),

                    'status' => 'generated',
                ]);
            }
        }
    }

    /**
     * =====================================================
     * GET FILTERED SUBJECTS
     * =====================================================
     */
    private function getSubjectsByProgram(
        $programId,
        $yearLevel,
        $semester
    ) {
        return Subject::where('program_id', $programId)
            ->where('year_level', $yearLevel)
            ->where('semester', $semester)
            ->orderBy('subject_code')
            ->get();
    }

    /**
     * =====================================================
     * STRICT SUBJECT VALIDATION
     * =====================================================
     */
    private function isSubjectAllowed(
        Section $section,
        Subject $subject
    ): bool {

        if (
            $subject->subject_type === 'major' &&
            (int)$subject->program_id !== (int)$section->program_id
        ) {
            return false;
        }

        if (
            (int)$subject->year_level !== (int)$section->year_level
        ) {
            return false;
        }

        if (
            (int)$subject->semester !== (int)$section->semester_id
        ) {
            return false;
        }

        return true;
    }

    /**
     * =====================================================
     * DOMAIN
     * =====================================================
     */
    private function resolveSubjectDomain(Subject $subject): string
    {
        if ($subject->subject_type === 'major') {
            return $this->getProgramDomain($subject->program_id);
        }

        return is_array($subject->domains)
            ? implode(',', $subject->domains)
            : ($subject->domains ?? 'GENERAL');
    }

    /**
     * =====================================================
     * PROGRAM DOMAIN
     * =====================================================
     */
    private function getProgramDomain($programId): string
    {
        $program = DB::table('programs')
            ->join(
                'departments',
                'programs.department_id',
                '=',
                'departments.id'
            )
            ->where('programs.id', $programId)
            ->select('departments.department_name')
            ->first();

        return $program->department_name ?? 'GENERAL';
    }

    /**
     * =====================================================
     * HARD CONSTRAINTS
     * =====================================================
     */
    private function detectHardConstraints(Subject $subject): array
    {
        $constraints = [];

        if (!empty($subject->preferred_teacher_id)) {
            $constraints[] = 'HARD_TEACHER';
        }

        if (!empty($subject->preferred_days)) {
            $constraints[] = 'HARD_DAY';
        }

        if (!empty($subject->preferred_shift)) {
            $constraints[] = 'HARD_SHIFT';
        }

        if (!empty($subject->room_type)) {
            $constraints[] = 'HARD_ROOM';
        }

        if (!empty($subject->preferred_room_id)) {
            $constraints[] = 'HARD_SPECIFIC_ROOM';
        }

        return $constraints;
    }
}