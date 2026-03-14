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

    private function hasConflictMemory($assignment, $roomId, $timeSlotId, $existingSchedules)
    {
        foreach ($existingSchedules as $schedule) {

            // ROOM CONFLICT
            if ($schedule->room_id == $roomId && $schedule->time_slot_id == $timeSlotId) {
                return true;
            }

            $otherAssignment = $schedule->assignment;

            // SECTION CONFLICT
            if (
                $otherAssignment->section_id == $assignment->section_id &&
                $schedule->time_slot_id == $timeSlotId
            ) {
                return true;
            }

            // FACULTY CONFLICT
            if (
                $assignment->faculty_id &&
                $otherAssignment->faculty_id == $assignment->faculty_id &&
                $schedule->time_slot_id == $timeSlotId
            ) {
                return true;
            }
        }

        return false;
    }


    // RESET SCHEDULE
    public function reset($versionId)
    {
        Schedule::where('schedule_version_id', $versionId)->delete();

        return back()->with('success', 'Schedule reset successfully');
    }


    // GENERATE SCHEDULE
    public function generate($versionId)
    {
        set_time_limit(300);

        $assignments = SectionSubjectAssignment::where('schedule_version_id', $versionId)
            ->with(['section', 'faculty', 'subject'])
            ->get();

        $rooms = Room::all();
        $timeslots = TimeSlot::all();

        $slots = [];

        // create all possible slots
        foreach ($timeslots as $timeslot) {
            foreach ($rooms as $room) {
                $slots[] = [
                    'room_id' => $room->id,
                    'time_slot_id' => $timeslot->id
                ];
            }
        }

        // shuffle slots for randomness
        shuffle($slots);

        $usedSlots = [];
        $sectionUsed = [];
        $facultyUsed = [];

        foreach ($assignments as $assignment) {

            foreach ($slots as $slot) {

                $key = $slot['room_id'] . '-' . $slot['time_slot_id'];

                if (isset($usedSlots[$key])) {
                    continue;
                }

                $sectionKey = $assignment->section_id . '-' . $slot['time_slot_id'];

                if (isset($sectionUsed[$sectionKey])) {
                    continue;
                }

                if ($assignment->faculty_id) {
                    $facultyKey = $assignment->faculty_id . '-' . $slot['time_slot_id'];

                    if (isset($facultyUsed[$facultyKey])) {
                        continue;
                    }
                }

                Schedule::create([
                    'schedule_version_id' => $versionId,
                    'assignment_id' => $assignment->id,
                    'room_id' => $slot['room_id'],
                    'time_slot_id' => $slot['time_slot_id']
                ]);

                $usedSlots[$key] = true;
                $sectionUsed[$sectionKey] = true;

                if ($assignment->faculty_id) {
                    $facultyUsed[$facultyKey] = true;
                }

                break;
            }
        }

        return back()->with('success', 'Schedule generated successfully');
    }


    public function index()
    {
        return Inertia::render('Schedules/Index', [

            'schedules' => Schedule::with([
                'assignment.section.program.department',
                'assignment.subject',
                'assignment.faculty',
                'room',
                'timeslot',
                'version.semester'
            ])->get(),

            'departments' => Department::with('programs')->get(),

            'programs' => Programs::with('department')->get(),

            'sections' => Section::with('program')->get(),

            'faculty' => Faculty::all(),
            'rooms' => Room::all(),
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


    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Schedule deleted');
    }
}
