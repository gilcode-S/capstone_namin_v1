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
    public function index(Request $request) // Added Request $request here
    {
        // 1. Detect which Set we are viewing (Default to Set A)
        $currentSet = $request->query('section_set', 'Set A');

        // 2. Get the Active Version
        $activeVersion = ScheduleVersion::where('status', 'Active')->first()
            ?? ScheduleVersion::latest()->first();

        $versionId = $activeVersion ? $activeVersion->id : null;
        $versionName = $activeVersion ? "{$activeVersion->academic_year} - {$activeVersion->semester}" : "Draft Schedule";

        // 3. Fetch schedules with your NEW filtering logic
        $schedules = Schedule::with([
            'subject:id,code',
            'teacher:id,name,code',
            'room:id,generated_name,capacity',
            'section:id,name,year_level', // Added year_level here
            'timeslot:id,start_time,end_time,day'
        ])
            ->where('schedule_version_id', $versionId)
            ->whereHas('section', function ($query) use ($currentSet) {
                if ($currentSet === 'Set A') {
                    // Set A logic: Show only 1st Year face-to-face
                    $query->where('year_level', 1);
                } else {
                    // Set B logic: Show 2nd, 3rd, and 4th Year
                    $query->whereIn('year_level', [2, 3, 4]);
                }
            })
            ->get()
            ->map(function ($schedule) use ($currentSet) {
                // 4. Force "ONLINE" label for Set B without changing React code
                if ($currentSet === 'Set B') {
                    // We temporarily override the room name in the data sent to the UI
                    if ($schedule->room) {
                        $schedule->room->generated_name = "ONLINE";
                    }
                }
                return $schedule;
            });

        // 5. Teachers List (Same as your original code)
        $teachers = Teacher::all()->map(function ($teacher) use ($versionId) {
            $hours = Schedule::where('schedule_version_id', $versionId)
                ->where('teacher_id', $teacher->id)
                ->with('timeslot')
                ->get()
                ->sum(function ($s) {
                    if (!$s->timeslot) return 0;
                    return (strtotime($s->timeslot->end_time) - strtotime($s->timeslot->start_time)) / 3600;
                });

            $teacher->current_hours = $hours;
            $teacher->workload_percent = $teacher->max_hours
                ? min(99, round(($hours / $teacher->max_hours) * 100))
                : 0;
            return $teacher;
        });

        // 6. Return data to the untouched Viewer UI
        return Inertia::render('Schedules/Viewer', [
            'activeVersion' => $versionName . " ($currentSet)", // Updates the title text
            'schedules' => $schedules,
            'rooms' => Room::orderBy('generated_name')->get(),
            'teachers' => $teachers,
            'sections' => Section::orderBy('name')->get(),
            'sectionSet' => $currentSet, // Keeps the React state in sync
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
