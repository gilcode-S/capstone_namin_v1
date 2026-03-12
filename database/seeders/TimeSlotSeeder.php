<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    public function run(): void
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        $startHour = 7;
        $endHour = 22; // 10 PM

        foreach ($days as $day) {

            for ($hour = $startHour; $hour < $endHour; $hour++) {

                $start = str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00:00';
                $end = str_pad($hour + 1, 2, '0', STR_PAD_LEFT) . ':00:00';

                TimeSlot::create([
                    'day_of_week' => $day,
                    'start_time' => $start,
                    'end_time' => $end,
                    'mode' => 'f2f',
                    'status' => 'active'
                ]); 
            }

        }
    }
}