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

        foreach ($rooms as $room) {
            foreach ($timeslots as $slot) {

                $locks[] = [
                    'room_id' => $room->id, // room reference
                    'time_slot_id' => $slot->id, // time reference
                    'day_of_week' => $slot->day_of_week, // Mon-Sun
                    'shift' => $slot->shift, // Morning/Afternoon/Evening
                    'is_pe_room' => $room->is_pe_room ?? false, // PE logic
                ];
            }
        }

        return $locks;
    }
}
