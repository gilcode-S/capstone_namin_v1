<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Super Admin
        // User::create([
        //     'name' => 'Super Admin',
        //     'email' => 'superadmin@example.com',
        //     'role' => 'super admin',
        //     'password' => Hash::make('password123'),
        // ]);

        // // HR
        // User::create([
        //     'name' => 'HR User',
        //     'email' => 'hr@example.com',
        //     'role' => 'hr',
        //     'password' => Hash::make('password123'),
        // ]);

        // // Registrar
        // User::create([
        //     'name' => 'Registrar User',
        //     'email' => 'registrar@example.com',
        //     'role' => 'registrar',
        //     'password' => Hash::make('password123'),
        // ]);

        // // Staff
        // User::create([
        //     'name' => 'Staff User',
        //     'email' => 'staff@example.com',
        //     'role' => 'staff',
        //     'password' => Hash::make('password123'),
        // ]);


        $this->call([
            //DepartmentSeeder::class,
            //ProgramSeeder::class,

           // SubjectSeeder::class,
            // SectionSeeder::class,
            //RoomSeeder::class,

             FacultySeeder::class,

            //TimeSlotSeeder::class,
            // SemesterSeeder::class,
            // ScheduleVersionSeeder::class,
            // AssignmentSeeder::class,
        ]);
    }
}
