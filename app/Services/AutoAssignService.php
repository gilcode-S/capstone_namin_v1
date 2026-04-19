<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Subject;

class AutoAssignService
{
    protected DomainScoringService $scoringService;

    public function __construct(DomainScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
    }

    public function assignBestFaculty(Subject $subject): ?Faculty
    {
        $faculties = Faculty::where('status', 'active')->get();

        $bestFaculty = null;
        $bestScore = 0;

        foreach ($faculties as $faculty) {

            // OPTIONAL: skip overloaded teachers
            if ($faculty->current_load >= $faculty->max_load_units) {
                continue;
            }

            $score = $this->scoringService
                ->calculateTeacherScore($faculty, $subject);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestFaculty = $faculty;
            }
        }

        return $bestFaculty;
    }
}