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
      
        return Inertia::render('dashboard', [
            'totalFaculty' => Faculty::count(),
            'totalRooms' => Room::count(),
            'totalSections' => Section::count(),
            'totalSubjects' => Subject::count(),


            'summary' => [
                'schedule' => Schedule::count(),
                'unassigned' => Schedule::whereNull('time_slot_id')->orWhereNull('room_id')->count(),
                'conflicts' => 0
            ] 
        ]);
    }
}
