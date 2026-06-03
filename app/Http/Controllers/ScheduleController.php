<?php


namespace App\Http\Controllers;


use App\Models\AuditLog;
use App\Models\CurriculumSubject;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Teacher;
use App\Models\Section;
use App\Models\Subject;
use Inertia\Inertia;
use Illuminate\Http\Request;


class ScheduleController extends Controller
{
    public function index(Request $request) // Added Request $request here
    {


        // 1. Detect which Set we are viewing (Default to Set A)


        // 2. Get the Active Version
        $versionId = $request->version;

        if ($versionId) {
            $activeVersion = ScheduleVersion::findOrFail($versionId);
        } else {
            $activeVersion = ScheduleVersion::where('status', 'Active')->first()
                ?? ScheduleVersion::latest()->first();
        }

        $versionId = $activeVersion?->id;

        $versionId = $activeVersion ? $activeVersion->id : null;
        $versionName = $activeVersion
            ? "#{$activeVersion->version_number} - {$activeVersion->status}"
            : "Draft Schedule";

        // 3. Fetch schedules with your NEW filtering logic
        $schedules = Schedule::with([
            'subject:id,code,name',
            'teacher:id,name,code',
            'room:id,generated_name,capacity,building,floor',
            'section.program:id,name,code',
            'timeslot:id,start_time,end_time,day,shift'
        ])
            ->where('schedule_version_id', $versionId)
            ->get();

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
            'activeVersion' => $versionName, // Updates the title text
            'activeVersionId' => $versionId,
            'semester' => $activeVersion?->semester,
            'academicYear' => $activeVersion?->academic_year,
            'schedules' => $schedules,
            'rooms' => Room::orderBy('generated_name')->get(),
            'teachers' => $teachers,
            'sections' => Section::orderBy('name')->get(),
            'timeslots' => TimeSlot::orderBy('start_time')->get(),
            'versions' => ScheduleVersion::orderByDesc('created_at')->get(),
            'subjects' => Subject::orderBy('name')->get(),
            'curriculumSubjects' => CurriculumSubject::with('subject')->get(),
            'versionStatus' => $activeVersion?->status,
            // Keeps the React state in sync
        ]);
    }





    public function update(Request $request, Schedule $schedule)
    {
        $newRoomId = $request->room_id ?? $schedule->room_id;
        $newTimeslotId = $request->timeslot_id ?? $schedule->timeslot_id;
        $newTeacherId = $request->teacher_id ?? $schedule->teacher_id;


        $isFirstYear = $schedule->section->year_level == 1;

        $conflict = Schedule::where('schedule_version_id', $schedule->schedule_version_id)
            ->where('timeslot_id', $newTimeslotId)
            ->where(function ($q) use ($newRoomId, $newTeacherId, $schedule, $isFirstYear) {
                // Room conflict ONLY if they are in the same Year Level Group
                $q->where(function ($roomQ) use ($newRoomId, $isFirstYear) {
                    $roomQ->where('room_id', $newRoomId)
                        ->whereHas('section', function ($sectionQ) use ($isFirstYear) {
                            if ($isFirstYear) {
                                $sectionQ->where('year_level', 1);
                            } else {
                                $sectionQ->whereIn('year_level', [2, 3, 4]);
                            }
                        });
                })
                    // Teacher and Section conflicts ALWAYS matter regardless of year
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
