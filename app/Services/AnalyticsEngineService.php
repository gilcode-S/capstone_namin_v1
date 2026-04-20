<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\Faculty;
use App\Models\Room;

class AnalyticsEngineService
{
    /**
     * MAIN ENTRY POINT
     */
    public function generateSnapshot($versionId)
    {
        $schedules = Schedule::where('schedule_version_id', $versionId)->get();

        return [
            'efficiency' => $this->calculateEfficiency($schedules),
            'teacher_utilization' => $this->teacherUtilization($schedules),
            'room_utilization' => $this->roomUtilization($schedules),
            'conflict_rate' => $this->conflictRate($schedules),

            'load_balance_score' => $this->loadBalance($schedules),
            'optimization_score' => $this->optimizationScore($schedules),

            'pattern' => $this->detectPatterns($schedules)
        ];
    }

    /**
     * HOW FULL IS YOUR SCHEDULE
     */
    private function calculateEfficiency($schedules): float
    {
        if ($schedules->count() === 0) return 0;

        return round(
            $schedules->whereNotNull('faculty_id')->count() / $schedules->count(),
            3
        );
    }

    /**
     * HOW MANY TEACHERS ARE USED
     */
    private function teacherUtilization($schedules): float
    {
        $totalTeachers = Faculty::count();

        if ($totalTeachers === 0) return 0;

        $usedTeachers = $schedules->pluck('faculty_id')->unique()->count();

        return round($usedTeachers / $totalTeachers, 3);
    }

    /**
     * HOW MANY ROOMS ARE USED
     */
    private function roomUtilization($schedules): float
    {
        $totalRooms = Room::count();

        if ($totalRooms === 0) return 0;

        $usedRooms = $schedules->pluck('room_id')->unique()->count();

        return round($usedRooms / $totalRooms, 3);
    }

    /**
     * SIMPLE CONFLICT RATE (if you already have conflict detection later)
     */
    private function conflictRate($schedules): float
    {
        if ($schedules->count() === 0) return 0;

        // basic heuristic (you can replace with real Conflict model later)
        $duplicates = $schedules
            ->groupBy(fn($s) => $s->room_id.'-'.$s->time_slot_id)
            ->filter(fn($group) => $group->count() > 1)
            ->count();

        return round($duplicates / $schedules->count(), 3);
    }

    /**
     * LOAD BALANCE (teacher fairness)
     */
    private function loadBalance($schedules): float
    {
        $loads = [];

        foreach ($schedules as $schedule) {
            $loads[$schedule->faculty_id] =
                ($loads[$schedule->faculty_id] ?? 0) + 1;
        }

        if (count($loads) === 0) return 0;

        $avg = array_sum($loads) / count($loads);

        $variance = 0;

        foreach ($loads as $load) {
            $variance += pow($load - $avg, 2);
        }

        return round(1 / (1 + $variance), 3);
    }

    /**
     * FINAL SCORE
     */
    private function optimizationScore($schedules): float
    {
        return round(
            (
                $this->calculateEfficiency($schedules) +
                $this->loadBalance($schedules) +
                $this->roomUtilization($schedules)
            ) / 3,
        3);
    }

    /**
     * PATTERN INTELLIGENCE
     */
    private function detectPatterns($schedules): array
    {
        $teacherLoad = [];
        $roomUsage = [];

        foreach ($schedules as $s) {
            $teacherLoad[$s->faculty_id] =
                ($teacherLoad[$s->faculty_id] ?? 0) + 1;

            $roomUsage[$s->room_id] =
                ($roomUsage[$s->room_id] ?? 0) + 1;
        }

        arsort($teacherLoad);
        arsort($roomUsage);

        return [
            'most_loaded_teacher' => array_key_first($teacherLoad),
            'most_used_room' => array_key_first($roomUsage),
            'top_heavy_teachers' => array_slice($teacherLoad, 0, 3, true),
        ];
    }
}