<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Room;
use App\Models\Teacher;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        // 1. Get the Active Version (or latest draft)
        $activeVersion = ScheduleVersion::where('status', 'Active')->first() 
                         ?? ScheduleVersion::latest()->first();

        $versionId = $activeVersion ? $activeVersion->id : null;
        $versionName = $activeVersion ? "{$activeVersion->academic_year} {$activeVersion->semester}" : "Template Mode (No Schedule Generated)";

        // 2. Fetch schedules mapped to relationships
        $schedules = Schedule::with(['subject', 'teacher', 'room', 'section', 'timeslot'])
            ->where('schedule_version_id', $versionId)
            ->get();

        // 3. Fetch Master Lists (These build the template grid!)
        $rooms = Room::orderBy('generated_name')->get();
        $teachers = Teacher::with('domains')->orderBy('name')->get();
        $sections = Section::orderBy('name')->get();

        return Inertia::render('Schedules/Viewer', [
            'activeVersion' => $versionName,
            'schedules' => $schedules,
            'rooms' => $rooms,
            'teachers' => $teachers,
            'sections' => $sections
        ]);
    }
}
