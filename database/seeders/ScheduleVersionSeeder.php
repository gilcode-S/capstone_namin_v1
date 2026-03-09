<?php

namespace Database\Seeders;

use App\Models\ScheduleVersion;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ScheduleVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $semester = Semester::first();
        $user = User::where('role', 'super admin')->first();

        if (!$semester) {
            $this->command->error("No semesters found! Run SemesterSeeder first.");
            return;
        }

        if (!$user) {
            $this->command->error("No super admin found! Run UserSeeder first.");
            return;
        }

        // Example: create 2 schedule versions for testing
        for ($i = 1; $i <= 2; $i++) {
            ScheduleVersion::create([
                'semester_id' => $semester->id,
                'version_number' => $i,
                'created_by' => $user->id,
                'is_active' => ($i === 1), // first version active
            ]);
        }
    }
}
