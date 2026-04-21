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

    public function index()
    {
        $schedules = Schedule::with([
            'faculty',
            'subject',
            'section',
            'room',
            'timeslot'
        ])->get();

        // 🔥 SUMMARY CALCULATIONS

        $totalClasses = $schedules->count();

        $activeRooms = $schedules->pluck('room_id')->unique()->count();


        $totalSections = $schedules
            ->pluck('section_id')
            ->unique()
            ->count();
        // WEEKLY HOURS (REAL COMPUTATION)
        $weeklyHours = $schedules->reduce(function ($total, $schedule) {

            $start = strtotime($schedule->timeslot->start_time);
            $end = strtotime($schedule->timeslot->end_time);

            $hours = ($end - $start) / 3600;

            return $total + $hours;
        }, 0);

        return Inertia::render('Schedules/Index', [

            'schedules' => $schedules,

            'summary' => [
                'total_classes' => $totalClasses,
                'weekly_hours' => $weeklyHours,
                'active_rooms' => $activeRooms,
                'total_sections' => $totalSections,
            ],

            'departments' => Department::with('programs')->get(),
            'programs' => Programs::with('department')->get(),
            'sections' => Section::with('program')->get(),
            'faculty' => Faculty::all(),
            'rooms' => Room::all()->groupBy('building')->map(function ($rooms) {
                return $rooms->values();
            }),
            'timeslots' => TimeSlot::all(),
            'versions' => ScheduleVersion::with('semester')->get(),

            'assignments' => SectionSubjectAssignment::with([
                'section.program',
                'subject',
                'faculty'
            ])->get()
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
