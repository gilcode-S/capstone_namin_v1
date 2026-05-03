<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TeacherRankingService;
use App\Services\CurriculumService;
use App\Services\RoomLockService;
use Illuminate\Support\Facades\DB;

class SetupController extends Controller
{
    /**
     * 🔘 BUTTON 1 — TEACHER RANKING
     */
    public function rankTeachers(Request $request)
    {
        $subjectId = $request->subject_id;

        $service = new TeacherRankingService();

        $service->rank($subjectId);

        // foreach ($ranked as $index => $data) {

        //     DB::table('teacher_rankings')->updateOrInsert(
        //         [
        //             'teacher_id' => $data['teacher_id'],
        //             'subject_id' => $subjectId,
        //         ],
        //         [
        //             'score' => $data['score'],
        //             'rank_position' => $index + 1,
        //             'subject_type' => $data['type'] ?? 'Minor',
        //         ]
        //     );
        // }

        return redirect()->back()->with('success', 'Teacher ranking completed and locked');
    }

    /**
     * 🔘 BUTTON 2 — CURRICULUM FETCH
     */
    public function fetchCurriculum(Request $request)
    {
        $sectionId = $request->section_id;

        $service = new CurriculumService();

        $subjects = $service->fetch($sectionId);

        foreach ($subjects as $subject) {

            DB::table('curriculum_snapshots')->updateOrInsert(
                [
                    'section_id' => $sectionId,
                    'subject_id' => $subject['subject_id'],
                ],
                [
                    'type' => $subject['type'],
                    'program_id' => $subject['program_id'],
                    'year_level' => $subject['year_level'] ?? null,
                    'semester' => $subject['semester'] ?? null,
                    'is_locked' => true,
                ]
            );
        }

        return redirect()->back()->with('success', 'curriculum lock completed and locked');
    }

    /**
     * 🔘 BUTTON 3 — ROOM + TIMESLOT LOCK
     */
    public function lockRooms()
    {
        $service = new RoomLockService();

        $locks = $service->generateLock();

        foreach ($locks as $lock) {

            DB::table('room_time_locks')->updateOrInsert(
                [
                    'room_id' => $lock['room_id'],
                    'time_slot_id' => $lock['time_slot_id'],
                ],
                [
                    'day' => $lock['day'] ?? null, // FIXED
                    'shift' => $lock['shift'] ?? null,
                    'is_pe_room' => $lock['is_pe_room'] ?? false, // ADD THIS TOO
                    'is_available' => true,
                    'is_online_slot' => false,
                ]
            );
        }

        return redirect()->back()->with('success', 'room timeslots completed and locked');
    }
}
