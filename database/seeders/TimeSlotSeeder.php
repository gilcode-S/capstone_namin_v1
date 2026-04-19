<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TimeSlot;
use Carbon\Carbon;

class TimeSlotSeeder extends Seeder
{
    public function run(): void
    {
        $days = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ];

        foreach ($days as $day) {

            $start = Carbon::createFromTime(7, 0);  // 7:00 AM
            $end   = Carbon::createFromTime(22, 0); // 10:00 PM

            while ($start < $end) {

                $slotStart = $start->copy();
                $slotEnd   = $start->copy()->addHour(); // 1-hour interval

                // 🔥 SHIFT LOGIC
                $hour = $slotStart->format('H');

                if ($hour < 12) {
                    $shift = 'morning';
                } elseif ($hour < 18) {
                    $shift = 'afternoon';
                } else {
                    $shift = 'evening';
                }

                TimeSlot::create([
                    'day_of_week' => $day,
                    'start_time'  => $slotStart->format('H:i:s'),
                    'end_time'    => $slotEnd->format('H:i:s'),
                    'shift'       => $shift,
                    'status'      => 'active',
                ]);

                $start->addHour();
            }
        }
    }
}