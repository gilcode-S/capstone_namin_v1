<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Department;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ GET CS DEPARTMENT ONLY
        $department = Department::where('department_name', 'Computer Science')->first();

        if (!$department) {
            throw new \Exception('Computer Science department not found.');
        }

        // ✅ ROOM TYPES
        $types = ['classroom', 'laboratory'];

        // ✅ BUILDINGS
        $buildings = ['C', 'F'];

        // ✅ EQUIPMENT PER TYPE
        $equipmentMap = [
            'classroom' => ['Projector', 'Whiteboard', 'Chairs'],
            'laboratory' => ['Computers', 'Projector', 'Aircon'],
            'pe_room' => ['Mats', 'Speakers']
        ];

        // ✅ CREATE CLASSROOMS (C101–C110)
        for ($i = 1; $i <= 10; $i++) {
            Room::create([
                'department_id' => $department->id,

                'room_name' => 'C' . str_pad($i, 3, '0', STR_PAD_LEFT),

                'resource_type' => 'classroom',

                'capacity' => rand(30, 50),

                'building' => 'C',
                'floor' => rand(1, 4),

                'equipment' => $equipmentMap['classroom'],

                'resource_status' => fake()->randomElement(['available', 'occupied', 'maintenance']),
            ]);
        }

        // ✅ CREATE LABS (Lab1–Lab5)
        for ($i = 1; $i <= 5; $i++) {
            Room::create([
                'department_id' => $department->id,

                'room_name' => 'Lab ' . $i,

                'resource_type' => 'laboratory',

                'capacity' => rand(25, 40),

                'building' => 'F',
                'floor' => rand(1, 3),

                'equipment' => $equipmentMap['laboratory'],

                'resource_status' => fake()->randomElement(['available', 'occupied', 'maintenance']),
            ]);
        }

        // ✅ OPTIONAL PE ROOM (shared)
        Room::create([
            'department_id' => $department->id,

            'room_name' => 'PE Room 1',

            'resource_type' => 'pe_room',

            'capacity' => 50,

            'building' => 'F',
            'floor' => 1,

            'equipment' => $equipmentMap['pe_room'],

            'resource_status' => 'available',
        ]);
    }
}