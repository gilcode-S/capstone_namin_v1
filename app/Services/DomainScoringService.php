<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;

class DomainScoringService
{
    public function calculateTeacherScore(Faculty $teacher, Subject $subject): float
    {
        $degreeScore = $this->getDegreeScore($teacher->degree);

        $fieldScore = $this->getFieldScore(
            $teacher->domains ?? [],
            $subject->domains ?? []
        );

        $programScore = $this->getProgramScore(
            $teacher->department_id,
            $subject->program_id
        );

        $experienceScore = $this->getExperienceScore($teacher->years_experience ?? 0);

        $availabilityScore = $this->getAvailabilityScore($teacher);

        return $this->normalizeScore([
            $degreeScore,
            $fieldScore,
            $programScore,
            $experienceScore,
            $availabilityScore
        ]);
    }

    private function getDegreeScore(?string $degree): float
    {
        return match($degree) {
            "Bachelor's Degree" => 0.6,
            "Master's Degree" => 0.8,
            "Doctorate / PhD / EdD" => 1.0,
            default => 0.5
        };
    }

    private function getFieldScore(array $teacherDomains, array $subjectDomains): float
    {
        $bestScore = 0.0;

        foreach ($teacherDomains as $teacherDomain) {
            foreach ($subjectDomains as $subjectDomain) {

                if ($teacherDomain === $subjectDomain) {
                    return 1.0;
                }

                $score = DB::table('domain_relations')
                    ->where(function ($q) use ($teacherDomain, $subjectDomain) {
                        $q->where('domain_a', $teacherDomain)
                          ->where('domain_b', $subjectDomain);
                    })
                    ->orWhere(function ($q) use ($teacherDomain, $subjectDomain) {
                        $q->where('domain_a', $subjectDomain)
                          ->where('domain_b', $teacherDomain);
                    })
                    ->value('score');

                if ($score) {
                    $bestScore = max($bestScore, $score);
                }
            }
        }

        return $bestScore > 0 ? $bestScore : 0.3;
    }

    private function getProgramScore(?int $teacherDept, ?int $subjectProgram): float
    {
        if (!$teacherDept || !$subjectProgram) return 0.5;

        if ($teacherDept === $subjectProgram) return 1.0;

        return 0.7;
    }

    private function getExperienceScore(int $years): float
    {
        return match(true) {
            $years >= 10 => 1.0,
            $years >= 5 => 0.8,
            $years >= 2 => 0.6,
            default => 0.4
        };
    }

    private function getAvailabilityScore(Faculty $teacher): float
    {
        $days = $teacher->availabilities()->count();

        if ($days >= 6) return 1.0;
        if ($days >= 5) return 0.9;
        if ($days >= 4) return 0.8;

        return 0.3;
    }

    private function normalizeScore(array $scores): float
    {
        return round(array_sum($scores) / count($scores), 3);
    }
}