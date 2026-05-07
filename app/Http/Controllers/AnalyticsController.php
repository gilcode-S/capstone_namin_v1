<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Room;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        // 1. Calculate Teacher Workload (Real Data)
        // In reality, you'd sum the units/hours from the schedules table for each teacher.
        $teachers = Teacher::take(5)->get()->map(function ($teacher) {
            // Mocking current hours for the visualizer. In prod: schedule()->sum('units')
            $currentHours = rand(10, $teacher->max_hours); 
            return [
                'name' => $teacher->name,
                'current' => $currentHours,
                'maximum' => $teacher->max_hours,
                'efficiency' => round(($currentHours / $teacher->max_hours) * 100)
            ];
        });

        // 2. High-Level KPI Stats
        $kpiStats = [
            'efficiency' => 89,
            'teacher_utilization' => 82,
            'room_utilization' => 75
        ];

        // 3. Chart Data Formats (Mirroring your mockups)
        $conflictTrends = [
            ['month' => 'Jan', 'detected' => 8, 'resolved' => 5],
            ['month' => 'Feb', 'detected' => 7, 'resolved' => 7],
            ['month' => 'Mar', 'detected' => 5, 'resolved' => 4],
            ['month' => 'Apr', 'detected' => 10, 'resolved' => 5],
            ['month' => 'May', 'detected' => 8, 'resolved' => 6],
            ['month' => 'Jun', 'detected' => 5, 'resolved' => 4],
        ];

        $roomUtilization = [
            ['day' => 'Mon', 'Classrooms' => 85, 'Computer Lab' => 70, 'PE Room' => 45],
            ['day' => 'Tue', 'Classrooms' => 95, 'Computer Lab' => 85, 'PE Room' => 60],
            ['day' => 'Wed', 'Classrooms' => 90, 'Computer Lab' => 92, 'PE Room' => 35],
            ['day' => 'Thu', 'Classrooms' => 92, 'Computer Lab' => 80, 'PE Room' => 50],
            ['day' => 'Fri', 'Classrooms' => 75, 'Computer Lab' => 65, 'PE Room' => 80],
        ];

        $departmentDist = [
            ['name' => 'Criminology', 'value' => 35, 'color' => '#FF0000'],
            ['name' => 'Tourism', 'value' => 28, 'color' => '#00FF00'],
            ['name' => 'Business', 'value' => 19, 'color' => '#FFFF00'],
            ['name' => 'Computer Science', 'value' => 18, 'color' => '#0000FF'],
        ];

        return Inertia::render('Analytics/Index', [
            'kpiStats' => $kpiStats,
            'teacherData' => $teachers,
            'conflictTrends' => $conflictTrends,
            'roomUtilization' => $roomUtilization,
            'departmentDist' => $departmentDist
        ]);
    }
}