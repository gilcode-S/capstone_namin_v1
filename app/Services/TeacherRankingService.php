<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Subject;
use App\Models\DomainRelation;

class TeacherRankingService
{
    /**
     * MAIN FUNCTION
     * Ranks all teachers for a given subject
     */
    public function rank($subjectId)
    {
        // get subject
        $subject = Subject::findOrFail($subjectId);

        // get all teachers
        $teachers = Faculty::all();

        $results = [];

        foreach ($teachers as $teacher) {

            // 🧠 1. DOMAIN MATCHING SCORE
            $domainScore = $this->getDomainScore(
                $teacher->domain_id,
                $subject->domain_id
            );

            // 🧠 2. EXPERIENCE SCORE (normalize max 10 yrs)
            $experienceScore = min($teacher->years_experience / 10, 1);

            // 🧠 3. DEGREE SCORE
            $degreeScore = $this->getDegreeScore($teacher->degree);

            // 🧠 4. LOAD FLEXIBILITY SCORE
            $loadScore = $this->getLoadScore(
                $teacher->min_load,
                $teacher->max_load
            );

            // 🧠 FINAL SCORE (weighted)
            $finalScore =
                ($domainScore * 0.4) +
                ($experienceScore * 0.2) +
                ($degreeScore * 0.2) +
                ($loadScore * 0.2);

            $results[] = [
                'teacher_id' => $teacher->id,
                'score' => round($finalScore, 3),
                'type' => $subject->type // Major / Minor
            ];
        }

        // sort descending
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);

        return $results;
    }

    /**
     * DOMAIN MATCH LOGIC
     */
    private function getDomainScore($teacherDomain, $subjectDomain)
    {
        // exact match
        if ($teacherDomain == $subjectDomain) {
            return 1.0;
        }

        // relation lookup
        $relation = DomainRelation::where('domain_a', $teacherDomain)
            ->where('domain_b', $subjectDomain)
            ->first();

        return $relation ? $relation->score : 0.3; // fallback
    }

    /**
     * DEGREE SCORE LOGIC
     */
    private function getDegreeScore($degree)
    {
        return match ($degree) {
            'PhD' => 1.0,
            'Master' => 0.8,
            'Undergraduate' => 0.6,
            default => 0.5
        };
    }

    /**
     * LOAD SCORE (BALANCE TEACHER LOAD)
     */
    private function getLoadScore($min, $max)
    {
        if ($max == 0) return 0.5;

        return 1 - (($max - $min) / $max);
    }
}


