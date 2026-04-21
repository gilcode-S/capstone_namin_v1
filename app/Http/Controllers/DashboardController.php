<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    //

    public function index()
    {  
        $totalSchedules = Schedule::count();
        $totalFaculty = Faculty::count();
        $totalRooms = Room::count();
        
        // basic formula for each progress
        $usedRooms = Schedule::whereNotNull('room_id')->distinct('room_id')->count('room_id');
        $roomUtilization = $totalRooms > 0 ? ($usedRooms / $totalRooms) * 100 : 0; 

        $avgload = $totalFaculty > 0 ? $totalSchedules / $totalFaculty : 0;
        $workloadScore = min(100, ($avgload / 5) * 100);

        $compactness = min(100, ($totalSchedules / 50) * 100);

        $conflicts  = 0;
        $conflictScore = max(0, 100 - ($conflicts * 10));
        
        return Inertia::render('dashboard', [
           'metrics' => [
            'faculty' => Faculty::count(),
            'rooms' => Room::count(),
            'subjects' => Subject::count(),
            'sections' => Section::count(),
           ],

           'optimization' => [
            'workload' => round($workloadScore),
            'rooms' => round($roomUtilization),
            'compactness' => round($compactness),
            'conflicts' => round($conflictScore),
           ],
        ]);
    }
}
