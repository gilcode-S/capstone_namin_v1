<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SectionSubjectAssignment;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Models\ScheduleVersion;

class GenerateController extends Controller
{
    public function index()
    {
        return Inertia::render("Schedules/Generate", [
            'versions' => ScheduleVersion::with('semester')->get()
        ]);
    }

    public function reset($versionId)
    {
        Schedule::where('schedule_version_id', $versionId)->delete();

        return redirect()->route('schedules.index');
    }

    public function generate($versionId)
    {
        set_time_limit(300);

        $assignments = SectionSubjectAssignment::where('schedule_version_id', $versionId)
            ->with(['section', 'faculty', 'subject'])
            ->get();

        $rooms = Room::all();
        $timeslots = TimeSlot::all();

        $slots = [];

        foreach ($timeslots as $timeslot) {
            foreach ($rooms as $room) {
                $slots[] = [
                    'room_id' => $room->id,
                    'time_slot_id' => $timeslot->id
                ];
            }
        }

        shuffle($slots);

        $usedSlots = [];
        $sectionUsed = [];
        $facultyUsed = [];

        foreach ($assignments as $assignment) {

            foreach ($slots as $slot) {

                $key = $slot['room_id'].'-'.$slot['time_slot_id'];

                if(isset($usedSlots[$key])) continue;

                $sectionKey = $assignment->section_id.'-'.$slot['time_slot_id'];

                if(isset($sectionUsed[$sectionKey])) continue;

                if($assignment->faculty_id){
                    $facultyKey = $assignment->faculty_id.'-'.$slot['time_slot_id'];

                    if(isset($facultyUsed[$facultyKey])) continue;
                }

                Schedule::create([
                    'schedule_version_id'=>$versionId,
                    'assignment_id'=>$assignment->id,
                    'room_id'=>$slot['room_id'],
                    'time_slot_id'=>$slot['time_slot_id']
                ]);

                $usedSlots[$key] = true;
                $sectionUsed[$sectionKey] = true;

                if($assignment->faculty_id){
                    $facultyUsed[$facultyKey] = true;
                }

                break;
            }
        }

        return redirect()->route('schedules.index');
    }
}