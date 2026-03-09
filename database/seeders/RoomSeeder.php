<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->error("No departments found! Run DepartmentSeeder first.");
            return;
        }

        $buildings = ['F', 'C', 'V']; // Front, Center, Vertical
        $floors = [1, 2, 3, 4];
        $roomsPerFloor = 5;

        foreach ($departments as $department) {
            foreach ($buildings as $building) {
                foreach ($floors as $floor) {
                    for ($i = 1; $i <= $roomsPerFloor; $i++) {
                        $roomNumber = $floor * 100 + $i;
                        $roomName = "{$department->department_code}-{$building}-{$roomNumber}"; // unique!

                        Room::create([
                            'department_id' => $department->id,
                            'room_name' => $roomName,
                            'room_type' => ($i % 2 == 0 ? 'laboratory' : 'lecture'),
                            'capacity' => rand(20, 60),
                            'status' => 'active',
                        ]);
                    }
                }
            }
        }
    }
}
