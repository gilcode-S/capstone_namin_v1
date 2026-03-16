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
    
        // group schedules by timeslot
        $grouped = $schedules->groupBy('time_slot_id');
    
        foreach ($grouped as $timeSlotId => $slotSchedules) {
    
            // ROOM conflicts
            $roomGroups = $slotSchedules->groupBy('room_id');
    
            foreach ($roomGroups as $roomId => $roomSchedules) {
                if ($roomSchedules->count() > 1) {
                    $conflicts[] = [
                        'type' => 'Room Conflict',
                        'items' => $roomSchedules
                    ];
                }
            }
    
            // FACULTY conflicts
            $facultyGroups = $slotSchedules->groupBy(function ($s) {
                return $s->assignment->faculty_id;
            });
    
            foreach ($facultyGroups as $facultyId => $facultySchedules) {
                if ($facultyId && $facultySchedules->count() > 1) {
                    $conflicts[] = [
                        'type' => 'Faculty Conflict',
                        'items' => $facultySchedules
                    ];
                }
            }
    
            // SECTION conflicts
            $sectionGroups = $slotSchedules->groupBy(function ($s) {
                return $s->assignment->section_id;
            });
    
            foreach ($sectionGroups as $sectionId => $sectionSchedules) {
                if ($sectionSchedules->count() > 1) {
                    $conflicts[] = [
                        'type' => 'Section Conflict',
                        'items' => $sectionSchedules
                    ];
                }
            }
        }
    
        return Inertia::render('Schedules/Conflicts', [
            'conflicts' => $conflicts
        ]);
    }
}