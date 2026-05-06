<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
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

        $fakeSchedules = collect([
            (object)[
                'room_id' => 1,
                'teacher_id' => 1,
                'timeslot_id' => 1,
            ],
            (object)[
                'room_id' => 2,
                'teacher_id' => 1,
                'timeslot_id' => 2,
            ],
            (object)[
                'room_id' => 1,
                'teacher_id' => 2,
                'timeslot_id' => 2,
            ],
        ]);
        // ================= BASIC COUNTS =================
        $totalSchedules = $fakeSchedules->count();
        $totalFaculty   = Teacher::count();
        $totalRooms     = Room::count();
        $totalSubjects  = Subject::count();
        $totalSections  = Section::count();

        // ================= ROOM UTILIZATION =================
        $usedRooms = $fakeSchedules
            ->pluck('room_id')
            ->unique()
            ->count();

        $roomUtilization = $totalRooms > 0
            ? ($usedRooms / $totalRooms) * 100
            : 0;

        // ================= TEACHER WORKLOAD BALANCE =================
        $teachers = Teacher::all()->map(function ($t) use ($fakeSchedules) {
            $t->schedules_count = $fakeSchedules
                ->where('teacher_id', $t->id)
                ->count();

            return $t;
        });

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
        $conflicts = $fakeSchedules
            ->groupBy(function ($item) {
                return $item->room_id . '-' . $item->timeslot_id;
            })
            ->filter(function ($group) {
                return $group->count() > 1;
            })
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
