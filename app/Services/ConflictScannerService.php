<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ConflictScannerService
{
    /**
     * Scans the database for scheduling conflicts.
     */
    public function scan()
    {
        $conflicts = [];

        // 1. TEACHER OVERLAP (Double Booking)
        // Find teachers scheduled in more than one room at the exact same timeslot
        $teacherConflicts = DB::table('schedules')
            ->select('teacher_id', 'timeslot_id', DB::raw('count(*) as count'))
            ->groupBy('teacher_id', 'timeslot_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($teacherConflicts as $conflict) {
            // Fetch the specific schedule rows that are conflicting
            $details = DB::table('schedules')
                ->join('subjects', 'schedules.subject_id', '=', 'subjects.id')
                ->join('timeslots', 'schedules.timeslot_id', '=', 'timeslots.id')
                ->join('teachers', 'schedules.teacher_id', '=', 'teachers.id')
                ->where('schedules.teacher_id', $conflict->teacher_id)
                ->where('schedules.timeslot_id', $conflict->timeslot_id)
                ->get();

            $conflicts[] = [
                'id' => 'T-' . $conflict->teacher_id . '-' . $conflict->timeslot_id,
                'type' => 'Teacher Overlap',
                'title' => 'Teacher Double Booking',
                'description' => $details->first()->name . ' is scheduled for multiple classes simultaneously.',
                'tags' => $details->pluck('code')->toArray(), // e.g., ['MATH101', 'PHYS201']
                'timeslot' => $details->first()->day . ' ' . substr($details->first()->start_time, 0, 5) . ' - ' . substr($details->first()->end_time, 0, 5),
                'status' => 'Unresolved'
            ];
        }

        // 2. ROOM OVERLAP
        // Find physical rooms assigned to more than one section at the same time
        $roomConflicts = DB::table('schedules')
            ->select('room_id', 'timeslot_id', DB::raw('count(*) as count'))
            ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
            ->where('rooms.type', '!=', 'Online') // Ignore online rooms for physical overlap
            ->groupBy('room_id', 'timeslot_id')
            ->having('count', '>', 1)
            ->get();

        foreach ($roomConflicts as $conflict) {
            $details = DB::table('schedules')
                ->join('subjects', 'schedules.subject_id', '=', 'subjects.id')
                ->join('rooms', 'schedules.room_id', '=', 'rooms.id')
                ->join('timeslots', 'schedules.timeslot_id', '=', 'timeslots.id')
                ->where('schedules.room_id', $conflict->room_id)
                ->where('schedules.timeslot_id', $conflict->timeslot_id)
                ->get();

            $conflicts[] = [
                'id' => 'R-' . $conflict->room_id . '-' . $conflict->timeslot_id,
                'type' => 'Room overlap',
                'title' => 'Classroom Conflict',
                'description' => 'Room ' . $details->first()->generated_name . ' assigned to multiple classes simultaneously.',
                'tags' => $details->pluck('code')->toArray(),
                'timeslot' => $details->first()->day . ' ' . substr($details->first()->start_time, 0, 5) . ' - ' . substr($details->first()->end_time, 0, 5),
                'status' => 'Unresolved'
            ];
        }

        return $conflicts;
    }
}