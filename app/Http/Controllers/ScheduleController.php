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

        $teachers = Teacher::all()->map(function ($teacher) use ($versionId) {

            $hours = Schedule::where('schedule_version_id', $versionId)
                ->where('teacher_id', $teacher->id)
                ->with('timeslot')
                ->get()
                ->sum(function ($s) {
                    if (!$s->timeslot) return 0;

                    $start = strtotime($s->timeslot->start_time);
                    $end = strtotime($s->timeslot->end_time);

                    return ($end - $start) / 3600; // convert seconds → hours
                });

            $teacher->current_hours = $hours;

            return $teacher;
        });

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
            'teachers' => $teachers,
            'sections' => Section::orderBy('name')->get()
        ]);
    }
}
