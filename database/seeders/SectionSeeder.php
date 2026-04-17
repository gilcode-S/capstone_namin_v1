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
        // ✅ ONLY CS PROGRAM
        $program = Programs::where('program_code', 'BC')->first();

        if (!$program) {
            throw new \Exception('BSCS program not found');
        }

        $semesters = Semester::all();

        $shifts = [
            'Morning' => 'M',
            'Afternoon' => 'A',
            'Evening' => 'E',
        ];

        $letters = ['A', 'B', 'C'];

        foreach ($semesters as $semester) {

            $semNumberMap = [
                '1st' => 1,
                '2nd' => 2,
                'summer' => 3,
            ];

            $semNumber = $semNumberMap[strtolower($semester->term)] ?? 1;

            for ($year = 1; $year <= 4; $year++) {

                $yearBase = ($year - 1) * 2 + $semNumber;

                foreach ($shifts as $shiftName => $shiftCode) {

                    foreach ($letters as $letter) {

                        Section::create([
                            'program_id' => $program->id,
                            'semester_id' => $semester->id,
                            'year_level' => $year,
                            'shift' => $shiftName,

                            'student_count' => rand(25, 45),

                            'section_name' =>
                                $program->program_code .
                                $yearBase .
                                $shiftCode .
                                $letter,
                        ]);
                    }
                }
            }
        }
    }
}