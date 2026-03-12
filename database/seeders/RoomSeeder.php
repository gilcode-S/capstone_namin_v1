<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->error('Run DepartmentSeeder first.');
            return;
        }

        $buildings = ['F', 'C', 'V'];
        $floors = [1,2,3];
        $roomsPerFloor = 4;

        foreach ($buildings as $index => $building) {

            $department = $departments[$index % $departments->count()];

            foreach ($floors as $floor) {

                for ($i = 1; $i <= $roomsPerFloor; $i++) {

                    $roomNumber = $floor . sprintf('%02d', $i);
                    $roomName = $building . $roomNumber;

                    Room::create([
                        'department_id' => $department->id,
                        'room_name' => $roomName,
                        'room_type' => ($i % 2 == 0) ? 'laboratory' : 'lecture',
                        'capacity' => rand(30,60),
                        'status' => 'active'
                    ]);
                }
            }
        }
    }
}