<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Schedule;
use App\Models\ScheduleVersion;
use App\Models\SectionSubjectAssignment;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    //
    public function index()
    {
        return Inertia::render('Schedules/Index', [
            'schedules' => Schedule::with([
                'assignment.section',
                'assignment.subject',
                'assignment.faculty',
                'room',
                'timeslot',
                'version.semester'
            ])->latest()->get(),

            'assignments' => SectionSubjectAssignment::with([
                'section',
                'subject',
                'faculty'
            ])->get(),

            'rooms' => Room::all(),
            'timeslots' => TimeSlot::all(),
            'versions' => ScheduleVersion::with('semester')->get()
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

        return redirect()->back()->with('success', 'schedule created');
    }


    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'schedule deleted');
    }
}
