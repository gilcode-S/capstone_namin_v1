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

    private function hasConflict($assignment, $roomId, $timeSlotId, $scheduleVersionId)
    {
        // ROOM CONFLICT
        $roomConflict = Schedule::where('schedule_version_id', $scheduleVersionId)
            ->where('room_id', $roomId)
            ->where('time_slot_id', $timeSlotId)
            ->exists();
        
        if ($roomConflict) {
            return true;
        }

        // SECTION CONFLICT
        $sectionConflict = Schedule::where('schedule_version_id', $scheduleVersionId)
            ->whereHas('assignment', function ($q) use ($assignment) {
                $q->where('section_id', $assignment->section_id);
            })
            ->where('time_slot_id', $timeSlotId)
            ->exists();

        if ($sectionConflict) {
            return true;
        }

        // FACULTY CONFLICT
        if ($assignment->faculty_id) {
            $facultyConflict = Schedule::where('schedule_version_id', $scheduleVersionId)
                ->whereHas('assignment', function ($q) use ($assignment) {
                    $q->where('faculty_id', $assignment->faculty_id);
                })
                ->where('time_slot_id', $timeSlotId)
                ->exists();

            if ($facultyConflict) {
                return true;
            }
        }

        return false;
    }
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
