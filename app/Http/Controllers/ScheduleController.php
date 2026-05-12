<?php


namespace App\Http\Controllers;


use App\Models\AuditLog;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Room;
use App\Models\Teacher;
use App\Models\Section;
use Inertia\Inertia;
use Illuminate\Http\Request;


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


                    return (
                        strtotime($s->timeslot->end_time) -
                        strtotime($s->timeslot->start_time)
                    ) / 3600;
                });


            $teacher->current_hours = $hours;


            // 🔥 ADD THIS (IMPORTANT)
            $teacher->workload_percent = $teacher->max_hours
                ? min(99, round(($hours / $teacher->max_hours) * 100))
                : 0;


            return $teacher;
        });


        // 2. Fetch schedules WITH all relationships
        // This is CRITICAL. If you don't load 'timeslot', the grid will be empty.
        $schedules = Schedule::with([
            'subject:id,code',
            'teacher:id,name,code',
            'room:id,generated_name,capacity',
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




    public function update(Request $request, Schedule $schedule)
    {
        $newRoomId = $request->room_id ?? $schedule->room_id;
        $newTimeslotId = $request->timeslot_id ?? $schedule->timeslot_id;
        $newTeacherId = $request->teacher_id ?? $schedule->teacher_id;


        $conflict = Schedule::where('schedule_version_id', $schedule->schedule_version_id)
            ->where('timeslot_id', $newTimeslotId)
            ->where(function ($q) use ($newRoomId, $newTeacherId, $schedule) {
                $q->where('room_id', $newRoomId)
                    ->orWhere('teacher_id', $newTeacherId)
                    ->orWhere('section_id', $schedule->section_id);
            })
            ->where('id', '!=', $schedule->id)
            ->exists();


        if ($conflict) {
            return back()->withErrors([
                'conflict' => 'Schedule conflict detected.',
            ]);
        }


        $schedule->update([
            'room_id' => $newRoomId,
            'timeslot_id' => $newTimeslotId,
            'teacher_id' => $newTeacherId,
        ]);


        return back()->with('success', 'Schedule updated.');
    }
}
