<?php

namespace Database\Seeders;

use App\Models\Programs;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $programs = Programs::all();

        for ($i = 1; $i <= 50; $i++) { // 50 subjects
            $program = $programs->random(); // pick random program for each subject

            Subject::create([
                'program_id' => $program->id,
                'subject_code' => 'SUBJ' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'subject_name' => 'Subject ' . $i,
                'units' => rand(2, 4),
                'lecture_hours' => rand(2, 3),
                'lab_hours' => rand(0, 2),
                'year_level' => rand(1, 4),
                'semester' => rand(1, 2),
            ]);
        }
    }
}