<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Shift;
use App\Models\FacultyAvailability;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $shifts = Shift::pluck('id')->toArray();
        $departments = Department::pluck('id')->toArray();

        $domainsList = [
            "Computer Science / IT",
            "Business / Management",
            "Tourism / Hospitality",
            "Criminology / Law",
            "General Education"
        ];

        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for ($i = 1; $i <= 20; $i++) {

            $faculty = Faculty::create([
                'department_id' => fake()->randomElement($departments),
                'faculty_code' => 'FAC-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'first_name' => fake()->firstName(),
                'last_name' => fake()->lastName(),
                'email' => fake()->unique()->safeEmail(),

                // ✅ MUST MATCH ENUM
                'employment_type' => fake()->randomElement(['full_time', 'part_time']),

                'max_load_units' => fake()->numberBetween(12, 24),
                'status' => 'active',

                'qualification_level' => fake()->randomElement(['Bachelor', 'Master', 'PhD']),
                'years_experience' => fake()->numberBetween(1, 15),

                'degree' => fake()->randomElement(['Bachelor', 'Master', 'PhD']),

                // ✅ ARRAY FIELD
                'domains' => fake()->randomElements($domainsList, rand(1, 2)),
            ]);

            // ✅ ADD AVAILABILITY (2–4 random days)
            $randomDays = collect($days)->random(rand(2, 4));

            foreach ($randomDays as $day) {
                FacultyAvailability::create([
                    'faculty_id' => $faculty->id,
                    'day_of_week' => $day,
                    'start_time' => '08:00:00',
                    'end_time' => '17:00:00',
                ]);
            }
            $randomShifts = collect($shifts)->random(rand(1, 2));

            $faculty->shifts()->attach($randomShifts);
        }
    }
}
