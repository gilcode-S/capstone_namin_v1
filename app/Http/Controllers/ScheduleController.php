<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Faculty;
use App\Models\Programs;
use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\SectionSubjectAssignment;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{

    public function index(Request $request)
    {
        $query = Schedule::with([
            'faculty',
            'subject',
            'section.program.department',
            'room',
            'timeslot'
        ]);

        // ================= FILTERS =================

        if ($request->filled('department_id')) {
            $query->whereHas('section.program.department', function ($q) use ($request) {
                $q->where('id', $request->department_id);
            });
        }

        if ($request->filled('day')) {
            $query->whereHas('timeslot', function ($q) use ($request) {
                $q->where('day_of_week', $request->day);
            });
        }

        if ($request->filled('building')) {
            $query->whereHas('room', function ($q) use ($request) {
                $q->where('building', $request->building);
            });
        }

        if ($request->filled('floor')) {
            $query->whereHas('room', function ($q) use ($request) {
                $q->where('floor', $request->floor);
            });
        }

        if ($request->filled('shift')) {
            $query->whereHas('timeslot', function ($q) use ($request) {
                $q->where('shift', $request->shift);
            });
        }
        if ($request->filled('section')) {
            $query->whereHas('section', function ($q) use ($request) {
                $q->where('section_name', 'like', '%' . $request->section . '%');
            });
        }

        $schedules = $query->get();

        // ================= SECTIONS =================
        // ================= SECTIONS (BASED ON FILTERED SCHEDULES) =================

        // get section IDs from filtered schedules
        $sectionsQuery = Section::with(['program']);

        if ($request->filled('section')) {
            $sectionsQuery->where('section_name', 'like', '%' . $request->section . '%');
        }
        
        $sections = $sectionsQuery->get();

        // apply search filter
        if ($request->filled('section')) {
            $sectionsQuery->where('section_name', 'like', '%' . $request->section . '%');
        }

        $sections = $sectionsQuery->get();
        // ================= CLASS UNITS (FROM CURRICULUM) =================
        $classUnits = app(\App\Services\Scheduler\ClassUnitService::class)
            ->generate($sections);

        // ================= SECTION SUMMARY (FOR UI) =================
        $sectionSummary = collect($classUnits)
            ->groupBy('section_id')
            ->map(function ($items) {

                return [
                    'section_id' => $items[0]['section_id'],
                    'section_name' => $items[0]['section_name'] ?? 'N/A',
                    'program_name' => $items[0]['program_name'] ?? 'N/A',

                    // 👇 your required values
                    'total_subjects' => collect($items)
                        ->unique('subject_id')
                        ->count(),

                    'total_units' => collect($items)
                        ->sum('sessions_needed'),
                ];
            })
            ->values();

        $sectionSchedules = $schedules
            ->groupBy('section_id')
            ->map(function ($items) {
                return $items->map(function ($s) {
                    return [
                        'day' => $s->timeslot->day_of_week,
                        'start_time' => $s->timeslot->start_time,
                        'end_time' => $s->timeslot->end_time,
                        'subject' => $s->subject->subject_code ?? '',
                        'room' => $s->room->room_name ?? '',
                        'teacher' => $s->faculty->first_name ?? '',
                    ];
                });
            });

        $teacherSchedules = $schedules
            ->groupBy('faculty_id')
            ->map(function ($items) {
                return $items->map(function ($s) {
                    return [
                        'day' => $s->timeslot->day_of_week,
                        'start_time' => $s->timeslot->start_time,
                        'end_time' => $s->timeslot->end_time,
                        'subject' => $s->subject->subject_code ?? '',
                        'section' => $s->section->section_name ?? '',
                        'room' => $s->room->room_name ?? '',
                    ];
                });
            });
        $teachers = Faculty::with(['department', 'subjects'])->get();

        $teacherSummary = $teachers->map(function ($f) {

            $subjects = $f->subjects;

            return [
                'id' => $f->id,
                'name' => $f->full_name,
                'department' => $f->department->department_name ?? 'N/A',

                'total_subjects' => $subjects->count(),

                // assume each subject = units (default 3)
                'total_units' => $subjects->sum(function ($s) {
                    return $s->units ?? 3;
                }),
            ];
        });
        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'section_schedules' => $sectionSchedules,
            'teachers' => $teacherSummary,

            'summary' => [
                'total_classes' => $schedules->count(),
                'weekly_hours' => 0,
                'active_rooms' => $schedules->pluck('room_id')->unique()->count(),
                'total_sections' => $schedules->pluck('section_id')->unique()->count(),
            ],

            // ================= SECTION VIEW DATA =================
            'sections' => $sectionSummary,

            // ================= OTHER DATA =================
            'rooms_grouped' => Room::all()->groupBy('building'),
            'rooms_flat' => Room::all(),
            'timeslots' => TimeSlot::all(),
            'departments' => Department::all(),

            'filters' => $request->only([
                'department_id',
                'day',
                'building',
                'floor',
                'shift',
                'section'
            ]),
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' => 'required|exists:schedule_versions,id',
            'assignment_id' => 'required|exists:section_subject_assignments,id',
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id'
        ]);

        Schedule::create($validated);

        return redirect()->back()->with('success', 'Schedule created');
    }
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'time_slot_id' => 'required|exists:time_slots,id'
        ]);

        $schedule->update($validated);

        return back()->with('success', 'schedule moved success');
    }






    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted');
    }
}
