<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('shifts')->insert([
            [
                'name' => 'Morning',
                'start_time' => '08:00',
                'end_time' => '12:00',
            ],
            [
                'name' => 'Afternoon',
                'start_time' => '13:00',
                'end_time' => '17:00',
            ],
            [
                'name' => 'Evening',
                'start_time' => '18:00',
                'end_time' => '21:00',
            ],
        ]);
    
    }
}
