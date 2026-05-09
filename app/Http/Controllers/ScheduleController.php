<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Room;
use App\Models\Teacher;
use App\Models\Section;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        // 1. Get the Active Version
        $activeVersion = ScheduleVersion::where('status', 'Active')->first()
            ?? ScheduleVersion::latest()->first();

        $versionId = $activeVersion ? $activeVersion->id : null;
        $versionName = $activeVersion ? "{$activeVersion->academic_year} - {$activeVersion->semester}" : "Draft Schedule";

        // 2. Fetch schedules WITH all relationships
        // This is CRITICAL. If you don't load 'timeslot', the grid will be empty.
        $schedules = Schedule::with([
            'subject:id,code',
            'teacher:id,name,code',
            'room:id,generated_name',
            'section:id,name',
            'timeslot:id,start_time,end_time,day'
        ])->where('schedule_version_id', $versionId)->get();

        // 3. Fetch Master Lists to build the Grid columns and Tab cards
        return Inertia::render('Schedules/Viewer', [
            'activeVersion' => $versionName,
            'schedules' => $schedules,
            'rooms' => Room::orderBy('generated_name')->get(),
            'teachers' => Teacher::orderBy('name')->get(),
            'sections' => Section::orderBy('name')->get()
        ]);
    }
}
