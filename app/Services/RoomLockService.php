<?php

namespace App\Services;

use App\Models\Room;
use App\Models\Timeslot;

class RoomLockService
{
    /**
     * GENERATE ROOM + TIME GRID
     */
    public function generateLock()
    {
        $rooms = Room::all();
        $timeslots = Timeslot::all();

        $locks = [];

        // NORMALIZED DAY MAP
        $dayMap = [
            'monday' => 'Mon',
            'mon' => 'Mon',

            'tuesday' => 'Tue',
            'tue' => 'Tue',

            'wednesday' => 'Wed',
            'wed' => 'Wed',

            'thursday' => 'Thu',
            'thu' => 'Thu',

            'friday' => 'Fri',
            'fri' => 'Fri',

            'saturday' => 'Sat',
            'sat' => 'Sat',

            'sunday' => 'Sun',
            'sun' => 'Sun',
        ];

        foreach ($rooms as $room) {
            foreach ($timeslots as $slot) {

                $rawDay = strtolower(trim($slot->day_of_week));

                $formattedDay = $dayMap[$rawDay] ?? null;

                // SKIP BAD DATA
                if (!$formattedDay) {
                    continue;
                }

                $locks[] = [
                    'room_id' => $room->id,
                    'time_slot_id' => $slot->id,
                    'day' => $formattedDay,
                    'shift' => $slot->shift,
                    'is_pe_room' => $room->type === 'PE',
                ];
            }
        }

        return $locks;
    }
}