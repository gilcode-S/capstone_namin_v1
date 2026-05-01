<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Subject;
use App\Models\DomainGroupRelation;
use App\Models\TeacherSubjectRanking;

class TeacherRankingService
{
    public function rank()
    {
        // GET ALL TEACHERS
        $teachers = Faculty::all();

        // GET ALL SUBJECTS
        $subjects = Subject::all();

        foreach ($teachers as $teacher) {
            foreach ($subjects as $subject) {

                // -----------------------------
                // DOMAIN GROUP MATCHING
                // -----------------------------
                $domainScore = $this->getDomainScore(
                    $teacher->domain_group_id,
                    $subject->domain_group_id
                );

                // -----------------------------
                // EXPERIENCE SCORE
                // -----------------------------
                $experienceScore = min($teacher->years_experience / 10, 1);

                // -----------------------------
                // DEGREE SCORE
                // -----------------------------
                $degreeScore = $this->degreeScore($teacher);

                // -----------------------------
                // FINAL SCORE
                // -----------------------------
                $finalScore =
                    ($domainScore * 0.5) +
                    ($experienceScore * 0.3) +
                    ($degreeScore * 0.2);

                // SAVE RESULT
                TeacherSubjectRanking::updateOrCreate(
                    [
                        'teacher_id' => $teacher->id,
                        'subject_id' => $subject->id
                    ],
                    [
                        'score' => $finalScore
                    ]
                );
            }
        }
    }

    // DOMAIN GROUP RELATION
    private function getDomainScore($a, $b)
    {
        if ($a == $b) return 1.0;

        $relation = DomainGroupRelation::where([
            ['domain_a', $a],
            ['domain_b', $b]
        ])->first();

        return $relation->score ?? 0.3;
    }

    // DEGREE LOGIC
    private function degreeScore($teacher)
    {
        if ($teacher->phd) return 1.0;
        if ($teacher->masters) return 0.8;
        return 0.6;
    }
}
