<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleGenerationService
{
    public function generate($versionId)
    {
        // -----------------------------------------
        // STEP 1: COLLECT DATA
        // -----------------------------------------
        $teachers = DB::table('teacher_subject_rankings')->get();
        $units = DB::table('scheduling_units')->get();
        $rooms = DB::table('room_time_locks')->get();

        // -----------------------------------------
        // STEP 2: TRANSFORM ROOMS (IMPORTANT FIX)
        // -----------------------------------------
        // $rooms = $roomLocks->groupBy('room_id')->map(function ($items, $roomId) {
        //     return [
        //         'id' => $roomId,
        //         'timeslots' => $items->map(function ($i) {
        //             return [
        //                 'id' => $i->time_slot_id
        //             ];
        //         })->values()
        //     ];
        // })->values();

        // -----------------------------------------
        // STEP 3: BUILD PAYLOAD
        // -----------------------------------------
        $payload = [
            'teachers' => $teachers->values(),
            'units' => $units->values(),
            'rooms' => $rooms,
        ];

        $payloadJson = json_encode($payload);

        $tempFile = tempnam(sys_get_temp_dir(), 'schedule_');
        file_put_contents($tempFile, $payloadJson);

        // -----------------------------------------
        // STEP 4: RUN PYTHON
        // -----------------------------------------
        $python = base_path('python/cp_sat_scheduler.py');

        $command = "python \"$python\" \"$tempFile\" 2>&1";
        $result = shell_exec($command);

        unlink($tempFile);

        // -----------------------------------------
        // STEP 5: PARSE RESULT
        // -----------------------------------------
        $data = json_decode($result, true);

        if (!$data || !isset($data['schedule'])) {
            Log::error("Invalid Python output: " . $result);
            throw new \Exception("Invalid Python output: " . $result);
        }

        // -----------------------------------------
        // STEP 6: CLEAR OLD DATA
        // -----------------------------------------
        DB::table('schedules')
            ->where('schedule_version_id', $versionId)
            ->delete();

        // -----------------------------------------
        // STEP 7: INSERT NEW SCHEDULE
        // -----------------------------------------
        foreach ($data['schedule'] as $item) {
            DB::table('schedules')->insert([
                'section_id' => $item['section_id'],
                'subject_id' => $item['subject_id'],
                'teacher_id' => $item['teacher_id'],
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

        // -----------------------------------------
        // STEP 8: APPLY SET LOGIC
        // -----------------------------------------
        $this->applySetLogic($versionId);

        return ['status' => 'Schedule Generated'];
    }

    private function applySetLogic($versionId)
    {
        // SET A: 2nd–4th year ONLINE
        DB::table('schedules')
            ->where('schedule_version_id', $versionId)
            ->where('set_type', 'A')
            ->whereIn('year_level', [2, 3, 4])
            ->update([
                'is_online' => true,
                'room_id' => null,
                'is_converted_online' => true
            ]);

        // SET B: 1st year ONLINE
        DB::table('schedules')
            ->where('schedule_version_id', $versionId)
            ->where('set_type', 'B')
            ->where('year_level', 1)
            ->update([
                'is_online' => true,
                'room_id' => null,
                'is_converted_online' => true
            ]);
    }
}