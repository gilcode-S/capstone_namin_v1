<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Department;
use App\Models\Schedule;
use App\Models\Room;
use App\Models\Conflict;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DB;

class AnalyticsController extends Controller
{
    /**
     * Calculates hours for a teacher based on their assigned schedules in a specific set.
     */
    private function calculateTeacherHours($teacherId, $set)
    {
        return Schedule::where('teacher_id', $teacherId)
            ->where('set', $set)
            ->with('timeslot')
            ->get()
            ->sum(function ($s) {
                if (!$s->timeslot) return 0;
                // Calculate duration in hours
                return (strtotime($s->timeslot->end_time) - strtotime($s->timeslot->start_time)) / 3600;
            });
    }

    public function index(Request $request)
    {
        // Default to 'A' if no set is provided via the switch
        $currentSet = $request->input('set', 'A');

        // 1. Teacher Workload (Filtered by Set)
        $teacherData = Teacher::take(10)->get()->map(function ($t) use ($currentSet) {
            $currentHours = $this->calculateTeacherHours($t->id, $currentSet);
            return [
                'name' => $t->name,
                'current' => $currentHours,
                'maximum' => $t->max_hours,
                'efficiency' => $t->max_hours > 0 ? round(($currentHours / $t->max_hours) * 100) : 0
            ];
        });

        // 2. Conflict Trends (Global history, not set-specific, to show system progress)
        $conflictTrends = collect(range(5, 0))->map(function ($i) {
            $month = Carbon::now()->subMonths($i);
            return [
                'month' => $month->format('M'),
                'detected' => Conflict::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
                'resolved' => Conflict::where('status', 'Resolved')
                    ->whereYear('resolved_at', $month->year)
                    ->whereMonth('resolved_at', $month->month)
                    ->count(),
            ];
        });

        // 3. Optimization Algorithm Metrics (Filtered by Set)
        $totalConflicts = Conflict::whereHas('scheduleA', fn($q) => $q->where('set', $currentSet))->count();
        $autoResolved = Conflict::where('resolution_method', 'Auto')
            ->whereHas('scheduleA', fn($q) => $q->where('set', $currentSet))->count();
        $manualResolved = Conflict::where('resolution_method', 'Manual')
            ->whereHas('scheduleA', fn($q) => $q->where('set', $currentSet))->count();

        $algoMetrics = [
            [
                'label' => 'Auto-Resolution Success',
                'value' => $totalConflicts > 0 ? round(($autoResolved / $totalConflicts) * 100) . '%' : '0%',
                'sub' => 'Engine-led fixes'
            ],
            [
                'label' => 'Manual Intervention',
                'value' => $totalConflicts > 0 ? round(($manualResolved / $totalConflicts) * 100) . '%' : '0%',
                'sub' => 'User-led adjustments'
            ],
            [
                'label' => 'Unresolved Issues',
                'value' => Conflict::where('status', 'Unresolved')
                    ->whereHas('scheduleA', fn($q) => $q->where('set', $currentSet))->count(),
                'sub' => 'Awaiting scan/fix'
            ],
            [
                'label' => 'Constraint Health',
                'value' => '98.2%', 
                'sub' => 'System stability'
            ],
        ];

        // 4. KPI Stats (Filtered by Set)
        $roomCount = Room::count();
        $scheduledRooms = Schedule::where('set', $currentSet)->distinct('room_id')->count();
        $resolvedCount = Conflict::where('status', 'Resolved')
            ->whereHas('scheduleA', fn($q) => $q->where('set', $currentSet))->count();

        $kpiStats = [
            'efficiency' => $totalConflicts > 0 ? round(($resolvedCount / $totalConflicts) * 100) : 100,
            'teacher_utilization' => round($teacherData->where('current', '>', 0)->count() / max(1, Teacher::count()) * 100),
            'room_utilization' => $roomCount > 0 ? round(($scheduledRooms / $roomCount) * 100) : 0
        ];

        // 5. Department Distribution (Pie Chart - Count Teachers active in this Set)
        $departmentDist = Department::get()->map(function($d) use ($currentSet) {
            $count = Teacher::where('department_id', $d->id)
                ->whereHas('schedules', fn($q) => $q->where('set', $currentSet))
                ->count();
            return [
                'name' => $d->name,
                'value' => $count
            ];
        });

        return Inertia::render('Analytics/Index', [
            'currentSet' => $currentSet, // Pass the set back to UI for the switch state
            'kpiStats' => $kpiStats,
            'teacherData' => $teacherData,
            'conflictTrends' => $conflictTrends,
            'algoMetrics' => $algoMetrics,
            'roomUtilization' => $this->getRoomUtilizationData($currentSet),
            'departmentDist' => $departmentDist,
        ]);
    }

    private function getRoomUtilizationData($set) {
        // Updated to include Sunday
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
   
        return collect($days)->map(function($day) use ($set) {
            // Helper to count hours by room type and day
            $getUtilization = function($type) use ($day, $set) {
                $hours = Schedule::where('set', $set)
                    ->where('day', $day)
                    ->whereHas('room', fn($q) => $q->where('type', $type))
                    ->with('timeslot')
                    ->get()
                    ->sum(function ($s) {
                        if (!$s->timeslot) return 0;
                        return (strtotime($s->timeslot->end_time) - strtotime($s->timeslot->start_time)) / 3600;
                    });
                
                // Return as percentage of a standard 12-hour school day
                return round(($hours / 12) * 100);
            };

            return [
                'day' => substr($day, 0, 3), // e.g., 'Mon'
                'Classroom' => $getUtilization('Classroom'),
                'Lab' => $getUtilization('Lab'),
                'PE' => $getUtilization('PE'),
                'Online' => $getUtilization('Online'),
            ];
        });
    }
}
