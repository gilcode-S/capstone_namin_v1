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
                'day_of_week' => $t->day_of_week,
                'start_time' => $t->start_time,
                'end_time' => $t->end_time,
                'mode' => $t->mode,
                'status' => $t->status,
            ];
        })->values();

        $rooms = Room::all()->map(function ($r) {
            return [
                'id' => $r->id,
                'room_name' => $r->room_name,
            ];
        })->values();

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
        })->values();

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

        if ($assignments->isEmpty()) {
            return back()->with('error', "No assignments for version {$versionId}");
        }

        // ✅ CLEAN ROOMS
        $rooms = Room::all()->map(function ($r) {
            return [
                'id' => $r->id,
                'room_name' => $r->room_name,
            ];
        })->values();

        // ✅ CLEAN TIMESLOTS (IMPORTANT FIX)
        $timeslots = TimeSlot::all()->map(function ($t) {
            return [
                'id' => $t->id,
                'day_of_week' => $t->day_of_week,
                'start_time' => $t->start_time,
                'end_time' => $t->end_time,
            ];
        })->values();

        // ✅ CLEAN ASSIGNMENTS (VERY IMPORTANT)
        $payloadAssignments = $assignments->map(function ($a) {
            return [
                'id' => $a->id,
                'section_id' => $a->section_id,
                'faculty_id' => $a->faculty_id,
                'units' => 3,
                'max_load' => 18,
            ];
        })->values();

        // 🚀 SEND TO FASTAPI (OPTIMIZED)
        $response = Http::timeout(120)
            ->retry(2, 100)
            ->post('http://127.0.0.1:8002/generate', [
                'assignments' => $payloadAssignments,
                'rooms' => $rooms,
                'timeslots' => $timeslots,
                'mode' => 'balanced',
            ]);

        if (!$response->successful()) {
            return back()->with('error', 'Solver failed: ' . $response->body());
        }

        $result = $response->json();

        Schedule::where('schedule_version_id', $versionId)->delete();

        foreach ($result['schedule'] ?? [] as $item) {
            Schedule::create([
                'schedule_version_id' => $versionId,
                'assignment_id' => $item['assignment_id'],
                'room_id' => $item['room_id'] ?? null,
                'time_slot_id' => $item['time_slot_id'],
            ]);
        }

        return redirect()->route('schedules.index');
    }
}