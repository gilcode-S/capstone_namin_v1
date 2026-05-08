<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Timeslot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TimeslotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', ];

        // Strict 1-hour blocks with your exact 5-hour shift limits
        $shifts = [
            'Morning' => [
                ['07:00', '08:00'],
                ['08:00', '09:00'],
                ['09:00', '10:00'],
                ['10:00', '11:00'],
                ['11:00', '12:00'],
            ],
            'Afternoon' => [
                ['12:00', '13:00'], // 12 PM - 1 PM
                ['13:00', '14:00'],
                ['14:00', '15:00'],
                ['15:00', '16:00'],
                ['16:00', '17:00'], // 4 PM - 5 PM
            ],
            'Evening' => [
                ['17:00', '18:00'], // 5 PM - 6 PM
                ['18:00', '19:00'],
                ['19:00', '20:00'],
                ['20:00', '21:00'],
                ['21:00', '22:00'], // 9 PM - 10 PM
            ],
        ];

        // Clear out any old timeslots just in case you run this twice
        Schema::disableForeignKeyConstraints();
        Timeslot::truncate();
        Schema::enableForeignKeyConstraints();

        // Loop through and build the perfect grid
        foreach ($days as $day) {
            foreach ($shifts as $shiftName => $times) {
                foreach ($times as $timeBlock) {
                    Timeslot::create([
                        'day' => $day,
                        'shift' => $shiftName,
                        'start_time' => $timeBlock[0],
                        'end_time' => $timeBlock[1],
                    ]);
                }
            }
        }
    }
}
