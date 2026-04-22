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

        $schedules = $query->get();

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,

            'summary' => [
                'total_classes' => $schedules->count(),
                'weekly_hours' => 0,
                'active_rooms' => $schedules->pluck('room_id')->unique()->count(),
                'total_sections' => $schedules->pluck('section_id')->unique()->count(),
            ],

            // ✅ IMPORTANT FIX: split room structures
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
