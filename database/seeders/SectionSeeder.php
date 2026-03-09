<?php

namespace Database\Seeders;

use App\Models\Programs;
use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $programs = Programs::all();

        $yearLevels = [1, 2, 3, 4];
        $sectionLetters = range('A', 'Z');

        for ($i = 1; $i <= 80; $i++) {
            $program = $programs->random(); // pick random program for each section
            $yearLevel = $yearLevels[array_rand($yearLevels)];
            $letter = $sectionLetters[array_rand($sectionLetters)];

            Section::create([
                'program_id' => $program->id,
                'section_name' => "BSIT {$yearLevel}{$letter}",
                'year_level' => $yearLevel,
                'student_count' => rand(20, 50),
            ]);
        }
    }
}