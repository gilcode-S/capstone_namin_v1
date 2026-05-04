<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class ScheduleGenerationService
{
    public function generate($versionId)
    {
        // STEP 1: collect precomputed data
        $teachers = DB::table('teacher_rankings')->get();
        $curriculum = DB::table('curriculum_snapshots')->get();
        $rooms = DB::table('room_time_locks')->get();

        // STEP 2: build JSON payload
        $payload = [
            'teachers' => $teachers,
            'curriculum' => $curriculum,
            'rooms' => $rooms,
        ];

        // STEP 3: send to Python CP-SAT API
        $response = Http::post('http://127.0.0.1:5000/generate', $payload);

        $data = $response->json();
    
        DB::table('schedules')->where('version_id', $versionId)->delete();
        // STEP 4: save results
        foreach ($data['schedule'] as $item) {

            DB::table('schedules')->insert([
                'section_id' => $item['section_id'],
                'subject_id' => $item['subject_id'],
                'faculty    _id' => $item['teacher_id'],
                'room_id' => $item['room_id'],
                'time_slot_id' => $item['timeslot_id'],
                'is_online' => $item['is_online'],
                'set_type' => $item['set_type'],
                'year_level' => $item['year_level'],
                'schedule_version_id' => $versionId,
                'base_mode' => 'F2F',
                'generated_from' => $item['generated_from'],
                'is_converted_online' => false,
            ]);
        }

        // STEP 5: apply Set A / Set B conversion
        $this->applySetLogic($versionId);

        return ['status' => 'Schedule Generated'];
    }

    private function applySetLogic($versionId)
    {
        // SET A: convert 2nd–4th year to ONLINE
        DB::table('schedules')
            ->where('version_id', $versionId)
            ->where('set_type', 'A')
            ->whereIn('year_level', [2, 3, 4])
            ->update([
                'is_online' => true,
                'room_id' => null,
                'is_converted_online' => true
            ]);

        // SET B: convert 1st year to ONLINE
        DB::table('schedules')
            ->where('version_id', $versionId)
            ->where('set_type', 'B')
            ->where('year_level', 1)
            ->update([
                'is_online' => true,
                'room_id' => null,
                'is_converted_online' => true
            ]);
    }
}
