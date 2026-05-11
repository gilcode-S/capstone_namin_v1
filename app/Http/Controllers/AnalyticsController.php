<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\Conflict;
use App\Models\OptimizationLog;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        // --- 1. TOP STAT CARDS ---
        $totalSubjects = Subject::count();
        $scheduledSubjects = Schedule::distinct('subject_id')->count();
        $efficiencyAve = $totalSubjects > 0 ? ($scheduledSubjects / $totalSubjects) * 100 : 0;

        $teacherUtil = Teacher::where('max_hours', '>', 0)
            ->selectRaw('AVG(current_hours / max_hours) * 100 as avg_util')
            ->first()->avg_util ?? 0;

        $totalSlots = Room::count() * 50; // Assuming 50 slots per room per week
        $usedSlots = Schedule::count();
        $roomUtil = $totalSlots > 0 ? ($usedSlots / $totalSlots) * 100 : 0;

        // --- 2. PERFORMANCE VIEW DATA ---
        $workloadData = Teacher::with('department')
            ->select('id', 'name', 'current_hours', 'max_hours', 'department_id')
            ->when($request->dept, function ($q) use ($request) {
                $q->whereHas('department', function ($sub) use ($request) {
                    $sub->where('department_name', $request->dept);
                });
            })
            ->get();

        $conflictTrend = Conflict::selectRaw("DATE_FORMAT(created_at, '%b') as month, 
            count(*) as detected, 
            sum(case when status = 'Resolved' then 1 else 0 end) as resolved")
            ->groupBy('month')
            ->orderBy('created_at')
            ->get();

        // --- 3. UTILIZATION VIEW DATA ---
        $roomTypeUsage = Room::join('schedules', 'rooms.id', '=', 'schedules.room_id')
            ->selectRaw('rooms.type, count(schedules.id) as count')
            ->groupBy('rooms.type')
            ->get();
        $deptDistribution = Schedule::join('subjects', 'schedules.subject_id', '=', 'subjects.id')
            ->join('programs', 'subjects.program_id', '=', 'programs.id')
            ->selectRaw('programs.name as name, count(schedules.id) as value')
            ->groupBy('programs.name')
            ->get();

        // --- 4. OPTIMIZATION LOGS ---
        $algoMetrics = OptimizationLog::latest()->take(4)->get();

        return Inertia::render('Analytics/Dashboard', [
            'stats' => [
                'efficiency' => round($efficiencyAve, 1),
                'teacher_util' => round($teacherUtil, 1),
                'room_util' => round($roomUtil, 1)
            ],
            'workloadData' => $workloadData,
            'conflictTrend' => $conflictTrend,
            'roomTypeUsage' => $roomTypeUsage,
            'deptDistribution' => $deptDistribution,
            'algoMetrics' => $algoMetrics,
            'filters' => $request->only(['dept', 'search'])
        ]);
    }
}
