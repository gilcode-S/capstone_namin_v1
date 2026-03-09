<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $departments = [
            ['department_name' => 'Computer Science', 'department_code' => 'CS'],
            ['department_name' => 'Tourism Management', 'department_code' => 'TM'],
            ['department_name' => 'Criminology', 'department_code' => 'CM'],
            ['department_name' => 'Business Administration', 'department_code' => 'BA'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }
    }
}
