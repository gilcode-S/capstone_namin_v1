<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ================= BASIC COUNTS =================
        $totalSchedules = Schedule::count();
        $totalFaculty   = Faculty::count();
        $totalRooms     = Room::count();
        $totalSubjects  = Subject::count();
        $totalSections  = Section::count();

        // ================= ROOM UTILIZATION =================
        $usedRooms = Schedule::whereNotNull('room_id')
            ->distinct('room_id')
            ->count('room_id');

        $roomUtilization = $totalRooms > 0
            ? ($usedRooms / $totalRooms) * 100
            : 0;

        // ================= TEACHER WORKLOAD BALANCE =================
        $teachers = Faculty::withCount('schedules')->get();

        $loads = $teachers->pluck('schedules_count');

        $avg = $loads->avg() ?? 0;

        $variance = $loads->map(function ($l) use ($avg) {
            return pow($l - $avg, 2);
        })->avg() ?? 0;

        $stdDev = sqrt($variance);

        // Lower std dev = better balance
        $workloadScore = $avg > 0
            ? max(0, 100 - (($stdDev / $avg) * 100))
            : 100;

        // ================= CONFLICT DETECTION =================
        // (needed for resolution score)
        $conflicts = Schedule::select('room_id', 'time_slot_id')
            ->groupBy('room_id', 'time_slot_id')
            ->havingRaw('COUNT(*) > 1')
            ->get()
            ->count();

        // ================= CONFLICT RESOLUTION =================
        $totalPossibleConflicts = max(1, $totalSchedules);

        $conflictResolutionScore = max(
            0,
            100 - (($conflicts / $totalPossibleConflicts) * 100)
        );

        // ================= RESOURCE EFFICIENCY =================
        // simplified (since compactness removed)
        $resourceEfficiency = $roomUtilization;

        // ================= RESPONSE =================
        return Inertia::render('dashboard', [
            'metrics' => [
                'faculty'  => $totalFaculty,
                'rooms'    => $totalRooms,
                'subjects' => $totalSubjects,
                'sections' => $totalSections,
            ],

            'optimization' => [
                'workload'            => round($workloadScore),
                'rooms'               => round($roomUtilization),

                // ✅ NEW FINAL METRICS
                'conflict_resolution' => round($conflictResolutionScore),
                'resource_efficiency' => round($resourceEfficiency),
            ],

            'summary' => [
                'conflicts' => $conflicts,
            ],
        ]);
    }
}