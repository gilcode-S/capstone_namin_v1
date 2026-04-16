<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Programs;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $program = Programs::where('program_code', 'BC')->first();

        if (!$program) {
            throw new \Exception('BSCS program not found. Please seed programs first.');
        }

        $names = [
            'Programming',
            'Database Systems',
            'Operating Systems',
            'Web Development',
            'Software Engineering',
            'Data Structures',
            'Algorithms',
            'Networking',
            'Information Security',
            'Artificial Intelligence',
            'Human Computer Interaction',
            'Mobile Development'
        ];

        $roomTypes = ['lecture', 'lab'];

        for ($i = 1; $i <= 40; $i++) {

            $type = fake()->randomElement(['major', 'minor']);

            Subject::create([
                // ✅ ONLY BSCS for major
                'program_id' => $type === 'major'
                    ? $program->id
                    : null,

                'subject_code' => 'CS-' . str_pad($i, 3, '0', STR_PAD_LEFT),

                'subject_name' => fake()->randomElement($names) . " " . rand(1, 3),

                'subject_type' => $type,

                'hours_per_week' => rand(2, 5),
                'units' => rand(2, 5),

                'room_type' => fake()->randomElement($roomTypes),

                'year_level' => rand(1, 4),
                'semester' => rand(1, 2),

                'preferred_shift' => fake()->randomElement(['morning', 'afternoon', 'evening']),
                'preferred_day' => fake()->randomElement(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
                'preferred_teacher' => null,

                // ✅ More realistic domain
                'domain' => "Computer Science / IT",
            ]);
        }
    }
}
