<?php

namespace App\Services\Scheduler;

class ScoringService
{
    public function score($teacher, $currentLoad = 0)
    {
        $degreeMap = [
            "Bachelor" => 0.6,
            "Master" => 0.8,
            "PhD" => 1.0
        ];

        // 🎓 degree score
        $degreeScore = $degreeMap[$teacher->degree] ?? 0.5;

        // 📈 experience score
        $expScore = min(($teacher->experience ?? 0) / 10, 1);

        // ⚖️ workload score
        $maxLoad = $teacher->max_load ?? 18;
        $workloadScore = 1 - ($currentLoad / max($maxLoad, 1));

        if ($workloadScore < 0) {
            $workloadScore = 0;
        }

        // 🧠 final weighted score
        return (
            0.4 * $degreeScore +
            0.3 * $expScore +
            0.3 * $workloadScore
        );
    }
}
