<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Semester;
use Carbon\Carbon;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $schoolYears = ['2025-2026', '2026-2027'];
        $terms = [
            ['term' => '1st', 'start' => '08-01', 'end' => '12-15'],
            ['term' => '2nd', 'start' => '01-05', 'end' => '05-20'],
            ['term' => 'summer', 'start' => '06-01', 'end' => '07-15'],
        ];

        foreach ($schoolYears as $year) {
            [$startYear, $endYear] = explode('-', $year); 

            foreach ($terms as $t) {
                $startDate = ($t['term'] === '2nd' || $t['term'] === 'summer')
                    ? Carbon::parse($endYear . '-' . $t['start'])
                    : Carbon::parse($startYear . '-' . $t['start']);

                $endDate = ($t['term'] === '2nd' || $t['term'] === 'summer')
                    ? Carbon::parse($endYear . '-' . $t['end'])
                    : Carbon::parse($startYear . '-' . $t['end']);

                Semester::create([
                    'school_year' => $year,
                    'term' => $t['term'],
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'upcoming',
                ]);
            }
        }
    }
}
