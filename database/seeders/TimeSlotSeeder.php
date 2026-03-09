<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        $times = [
            ['07:00:00', '08:00:00'],
            ['08:00:00', '09:00:00'],
            ['09:00:00', '10:00:00'],
            ['10:00:00', '11:00:00'],
            ['13:00:00', '14:00:00'],
            ['14:00:00', '15:00:00'],
            ['15:00:00', '16:00:00'],
            ['16:00:00', '17:00:00'],
        ];

        foreach ($days as $day) {
            foreach ($times as $time) {
                TimeSlot::create([
                    'day_of_week' => $day,
                    'start_time' => $time[0],
                    'end_time' => $time[1],
                    'mode' => 'f2f',
                    'status' => 'active'
                ]);
            }
        }
    }
}
