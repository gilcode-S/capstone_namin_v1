<?php

namespace Database\Seeders;

use App\Models\Programs;
use App\Models\Room;
use App\Models\Department;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        Room::insert([
            [
                'department_id' => 1,
                'room_name' => 'Room 101',
                'resource_type' => 'lecture',
                'capacity' => 40,
                'building' => 'Main',
                'floor' => 1,
                'equipment' => json_encode(['projector']),
                'resource_status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'department_id' => 1,
                'room_name' => 'Lab 201',
                'resource_type' => 'lab',
                'capacity' => 30,
                'building' => 'Science',
                'floor' => 2,
                'equipment' => json_encode(['computers']),
                'resource_status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
