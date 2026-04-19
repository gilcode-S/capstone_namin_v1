<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class DomainRelationService
{
    /**
     * MAIN FUNCTION
     * Returns compatibility score between teacher and subject
     */
    public function getFieldScore(string $teacherField, array $subjectDomains): float
    {
        $bestScore = 0;

        foreach ($subjectDomains as $domain) {

            // 1. EXACT MATCH (HIGHEST PRIORITY)
            if ($teacherField === $domain) {
                return 1.0;
            }

            // 2. DATABASE RELATION MATCH
            $score = $this->getRelationScore($teacherField, $domain);

            $bestScore = max($bestScore, $score);
        }

        // 3. DEFAULT FALLBACK
        return $bestScore > 0 ? $bestScore : 0.3;
    }

    /**
     * READ FROM DOMAIN RELATION TABLE
     */
    private function getRelationScore(string $a, string $b): float
    {
        return DB::table('domain_relations')
            ->where(function ($q) use ($a, $b) {
                $q->where('domain_a', $a)
                  ->where('domain_b', $b);
            })
            ->orWhere(function ($q) use ($a, $b) {
                $q->where('domain_a', $b)
                  ->where('domain_b', $a);
            })
            ->value('score') ?? 0;
    }
}