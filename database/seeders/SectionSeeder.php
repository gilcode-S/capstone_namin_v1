<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Section;
use App\Models\Programs;
use App\Models\Semester;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $programs = Programs::all();
        $semesters = Semester::all();

        $shifts = [
            'Morning' => 'M',
            'Afternoon' => 'A',
            'Evening' => 'E',
        ];

        for ($i = 1; $i <= 30; $i++) {

            $program = $programs->random();
            $semester = $semesters->random();

            $year = rand(1, 4);
            $semNumber = $semester->semester_number;

            $shiftName = array_rand($shifts);
            $shiftCode = $shifts[$shiftName];

            $sectionLetter = chr(rand(65, 68)); // A–D

            $yearSemCode = ($year - 1) * 2 + $semNumber;

            $programCode = $program->code ?? strtoupper(substr($program->name, 0, 4));

            $sectionName = $programCode . $yearSemCode . $shiftCode . $sectionLetter;

            Section::create([
                'program_id' => $program->id,
                'semester_id' => $semester->id,
                'section_name' => $sectionName,
                'year_level' => $year,
                'shift' => $shiftName,
                'student_count' => rand(25, 50),
            ]);
        }
    }
}
