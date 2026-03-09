<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Programs; // your plural model
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        $programs = [
            ['name' => 'Bachelor of Science in Computer Science', 'code' => 'BSCS'],
            ['name' => 'Bachelor of Science in Tourism', 'code' => 'BST'],
            ['name' => 'Bachelor of Science in Criminology', 'code' => 'BSCM'],
            ['name' => 'Bachelor of Science in Business Administration', 'code' => 'BSBA'],
        ];

        foreach ($programs as $p) {
            $department = $departments->random(); // pick a random department
            Programs::create([
                'department_id' => $department->id,
                'program_name' => $p['name'],
                'program_code' => $p['code'],
            ]);
        }
    }
}