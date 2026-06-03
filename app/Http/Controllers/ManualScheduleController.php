<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Timeslot;
use Illuminate\Http\Request;

class ManualScheduleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'schedule_version_id' =>
                'required|exists:schedule_versions,id',

            'section_id' =>
                'required|exists:sections,id',

            'subject_id' =>
                'required|exists:subjects,id',

            'teacher_id' =>
                'required|exists:teachers,id',

            'room_id' =>
                'required|exists:rooms,id',

            'timeslot_id' =>
                'required|exists:timeslots,id',
        ]);

        /**
         * TEACHER CONFLICT
         */
        $teacherConflict = Schedule::where(
            'schedule_version_id',
            $validated['schedule_version_id']
        )
            ->where(
                'timeslot_id',
                $validated['timeslot_id']
            )
            ->where(
                'teacher_id',
                $validated['teacher_id']
            )
            ->exists();

        if ($teacherConflict) {

            return back()->withErrors([
                'teacher_id' =>
                    'Teacher already has a schedule in this timeslot.'
            ]);
        }

        /**
         * ROOM CONFLICT
         */
        $roomConflict = Schedule::where(
            'schedule_version_id',
            $validated['schedule_version_id']
        )
            ->where(
                'timeslot_id',
                $validated['timeslot_id']
            )
            ->where(
                'room_id',
                $validated['room_id']
            )
            ->exists();

        if ($roomConflict) {

            return back()->withErrors([
                'room_id' =>
                    'Room already occupied during this timeslot.'
            ]);
        }

        /**
         * SECTION CONFLICT
         */
        $sectionConflict = Schedule::where(
            'schedule_version_id',
            $validated['schedule_version_id']
        )
            ->where(
                'timeslot_id',
                $validated['timeslot_id']
            )
            ->where(
                'section_id',
                $validated['section_id']
            )
            ->exists();

        if ($sectionConflict) {

            return back()->withErrors([
                'section_id' =>
                    'Section already has a schedule in this timeslot.'
            ]);
        }

        /**
         * CREATE SCHEDULE
         */
        Schedule::create([

            'schedule_version_id' =>
                $validated['schedule_version_id'],

            'section_id' =>
                $validated['section_id'],

            'subject_id' =>
                $validated['subject_id'],

            'teacher_id' =>
                $validated['teacher_id'],

            'room_id' =>
                $validated['room_id'],

            'timeslot_id' =>
                $validated['timeslot_id'],

            'set' => 'A',

            'is_fallback' => false,
        ]);

        return back()->with(
            'success',
            'Schedule added successfully.'
        );
    }
}