<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Department;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ CS ONLY
        $department = Department::where('department_name', 'Computer Science')->first();

        if (!$department) {
            throw new \Exception('Computer Science department not found');
        }

        $equipmentClassroom = ['Projector', 'Whiteboard', 'Chairs'];
        $equipmentLab = ['Computers', 'Projector', 'Aircon', 'LAN Ports'];
        $equipmentPE = ['Speakers', 'Mats', 'Open Space'];

        // =========================
        // 🏫 40 CLASSROOMS
        // =========================
        for ($i = 1; $i <= 40; $i++) {

            Room::create([
                'department_id' => $department->id,

                'room_name' => 'C' . str_pad($i, 3, '0', STR_PAD_LEFT),

                'resource_type' => 'classroom',

                'capacity' => rand(30, 50),

                'building' => 'C',
                'floor' => rand(1, 4),

                'equipment' => $equipmentClassroom,

                'resource_status' => fake()->randomElement([
                    'available', 'available', 'available',
                    'occupied',
                    'maintenance'
                ]),
            ]);
        }

        // =========================
        // 💻 15 LABORATORIES
        // =========================
        for ($i = 1; $i <= 15; $i++) {

            Room::create([
                'department_id' => $department->id,

                'room_name' => 'LAB-' . str_pad($i, 2, '0', STR_PAD_LEFT),

                'resource_type' => 'laboratory',

                'capacity' => rand(25, 40),

                'building' => 'F',
                'floor' => rand(1, 3),

                'equipment' => $equipmentLab,

                'resource_status' => fake()->randomElement([
                    'available', 'available', 'available',
                    'occupied',
                    'maintenance'
                ]),
            ]);
        }

        // =========================
        // 🏃 5 PE / MULTI ROOMS
        // =========================
        for ($i = 1; $i <= 5; $i++) {

            Room::create([
                'department_id' => $department->id,

                'room_name' => 'PE-' . str_pad($i, 2, '0', STR_PAD_LEFT),

                'resource_type' => 'pe_room',

                'capacity' => rand(40, 80),

                'building' => 'G',
                'floor' => 1,

                'equipment' => $equipmentPE,

                'resource_status' => 'available',
            ]);
        }
    }
}