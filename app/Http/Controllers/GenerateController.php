<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
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
        $versions = ScheduleVersion::with('semester')->get();
        $timeSlots = TimeSlot::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'day_of_week' => $t->day_of_week, // normalize here
                'start_time' => $t->start_time,
                'end_time' => $t->end_time,
                'mode' => $t->mode,
                'status' => $t->status,
            ];
        });

        $rooms = Room::all()->map(function ($r) {
            return [
                'id' => $r->id,
                'room_name' => $r->room_name,
            ];
        });

        $assignments = SectionSubjectAssignment::with([
            'section.program',
            'subject',
            'faculty'
        ])->get()->map(function ($a) {
            return [
                'id' => $a->id,
                'section_id' => $a->section_id,
                'subject_id' => $a->subject_id,
                'faculty_id' => $a->faculty_id,
            ];
        });

        return Inertia::render("Schedules/Generate", [
            'versions' => $versions,
            'timeSlots' => $timeSlots,
            'rooms' => $rooms,
            'assignments' => $assignments,
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

        // send data to python
        $response = Http::timeout(300)->post('http://127.0.0.1:8002/generate', [
            'assignments' => $assignments->map(fn($a) => [
                'id' => $a->id,
                'section_id' => $a->section_id,
                'faculty_id' => $a->faculty_id,
            ]),
            'rooms' => $rooms->map(fn($r) => [
                'id' => $r->id
            ]),
            'timeslots' => $timeslots->map(fn($t) => [
                'id' => $t->id,
                'day_of_week' => $t->day_of_week,
                'start_time' => $t->start_time,
                'end_time' => $t->end_time,
                'mode' => $t->mode,
                'status' => $t->status,
            ])
        ]);

        if (!$response->successful()) {
            return back()->with('error', 'Solver failed');
        }

        $result = $response->json();
        // dd($response->json());
        // clear old schedules
        Schedule::where('schedule_version_id', $versionId)->delete();

        foreach ($result['schedule'] as $item) {

            Schedule::create([
                'schedule_version_id' => $versionId,
                'assignment_id' => $item['assignment_id'],
                'room_id' => $item['room_id'],
                'time_slot_id' => $item['time_slot_id']
            ]);
        }

        return redirect()->route('schedules.index');
    }
}
