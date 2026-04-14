<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Programs;
use App\Models\Subject;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $bscs = Programs::where('program_code', 'BSCS')->first();

        if (!$bscs) {
            dd('BSCS program not found');
        }

        $math101 = Subject::create([
            'subject_code' => 'MATH101',
            'subject_name' => 'Basic Mathematics',
            'program_id' => $bscs->id,
            'subject_type' => 'major',
            'hours_per_week' => 3,
            'year_level' => 1,
            'semester' => 1,
        ]);

        $math102 = Subject::create([
            'subject_code' => 'MATH102',
            'subject_name' => 'Advanced Mathematics',
            'program_id' => $bscs->id,
            'subject_type' => 'major',
            'hours_per_week' => 3,
            'year_level' => 1,
            'semester' => 2,
        ]);

        $math102->prerequisites()->attach($math101->id);
    }
}