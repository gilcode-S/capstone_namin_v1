<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Schedule;

class ConflictController extends Controller
{
    public function index()
    {

        $schedules = Schedule::with([
            'assignment.section',
            'assignment.subject',
            'assignment.faculty',
            'room',
            'timeslot'
        ])->get();

        $conflicts = [];

        foreach ($schedules as $a) {

            foreach ($schedules as $b) {

                if ($a->id >= $b->id) continue;

                if (
                    $a->timeslot->day_of_week === $b->timeslot->day_of_week &&
                    $a->timeslot->start_time === $b->timeslot->start_time
                ) {

                    // Faculty conflict
                    if ($a->assignment->faculty_id === $b->assignment->faculty_id) {

                        $conflicts[] = [
                            'type' => 'Faculty Conflict',
                            'day' => $a->timeslot->day_of_week,
                            'time' => $a->timeslot->start_time,
                            'message' =>
                                $a->assignment->faculty->first_name .
                                ' is teaching two classes at the same time.',
                            'a' => $a,
                            'b' => $b,
                        ];
                    }

                    // Room conflict
                    if ($a->room_id === $b->room_id) {

                        $conflicts[] = [
                            'type' => 'Room Conflict',
                            'day' => $a->timeslot->day_of_week,
                            'time' => $a->timeslot->start_time,
                            'message' =>
                                'Room ' . $a->room->room_name . ' is double booked.',
                            'a' => $a,
                            'b' => $b,
                        ];
                    }

                    // Section conflict
                    if ($a->assignment->section_id === $b->assignment->section_id) {

                        $conflicts[] = [
                            'type' => 'Section Conflict',
                            'day' => $a->timeslot->day_of_week,
                            'time' => $a->timeslot->start_time,
                            'message' =>
                                'Section ' . $a->assignment->section->section_name . ' has two subjects at the same time.',
                            'a' => $a,
                            'b' => $b,
                        ];
                    }

                }

            }

        }

        return Inertia::render('Schedules/Conflicts', [
            'conflicts' => $conflicts
        ]);
    }
}