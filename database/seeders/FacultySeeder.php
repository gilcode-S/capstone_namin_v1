<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Faculty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        if ($departments->isEmpty()) {
            $this->command->error("No departments found! Run DepartmentSeeder first.");
            return;
        }

        $firstNames = ['John', 'Maria', 'Jose', 'Ana', 'Carlos', 'Elena', 'Mark', 'Sophia', 'David', 'Luna'];
        $lastNames = ['Reyes', 'Santos', 'Lopez', 'Garcia', 'Cruz', 'Torres', 'Martinez', 'Delgado', 'Navarro', 'Flores'];

        for ($i = 1; $i <= 30; $i++) {
            $department = $departments->random(); // pick random department
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];

            Faculty::create([
                'department_id' => $department->id,
                'faculty_code' => 'FAC-' . Str::upper(Str::random(5)),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower($firstName . '.' . $lastName . $i . '@example.com'),
                'employement_type' => (rand(0, 1) ? 'full_time' : 'part_time'),
                'max_load_units' => 21,
                'status' => 'active',
            ]);
        }
    }
}