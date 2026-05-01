<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainRelationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('domain_relations')->insert([

            // 1 Computer Studies / IT
            ['domain_a' => 1, 'domain_b' => 2, 'score' => 5],
            ['domain_a' => 1, 'domain_b' => 3, 'score' => 5],
            ['domain_a' => 1, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 1, 'domain_b' => 5, 'score' => 4],
            ['domain_a' => 1, 'domain_b' => 6, 'score' => 3],
            ['domain_a' => 1, 'domain_b' => 7, 'score' => 5],
            ['domain_a' => 1, 'domain_b' => 8, 'score' => 3],
            ['domain_a' => 1, 'domain_b' => 9, 'score' => 3],
            ['domain_a' => 1, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 1, 'domain_b' => 11, 'score' => 3],
            ['domain_a' => 1, 'domain_b' => 12, 'score' => 4],

            // 2 Engineering
            ['domain_a' => 2, 'domain_b' => 1, 'score' => 5],
            ['domain_a' => 2, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 2, 'domain_b' => 4, 'score' => 3],
            ['domain_a' => 2, 'domain_b' => 5, 'score' => 4],
            ['domain_a' => 2, 'domain_b' => 6, 'score' => 2],
            ['domain_a' => 2, 'domain_b' => 7, 'score' => 5],
            ['domain_a' => 2, 'domain_b' => 8, 'score' => 4],
            ['domain_a' => 2, 'domain_b' => 9, 'score' => 2],
            ['domain_a' => 2, 'domain_b' => 10, 'score' => 3],
            ['domain_a' => 2, 'domain_b' => 11, 'score' => 5],
            ['domain_a' => 2, 'domain_b' => 12, 'score' => 5],

            // 3 Business & Accountancy
            ['domain_a' => 3, 'domain_b' => 1, 'score' => 5],
            ['domain_a' => 3, 'domain_b' => 2, 'score' => 4],
            ['domain_a' => 3, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 3, 'domain_b' => 5, 'score' => 3],
            ['domain_a' => 3, 'domain_b' => 6, 'score' => 3],
            ['domain_a' => 3, 'domain_b' => 7, 'score' => 4],
            ['domain_a' => 3, 'domain_b' => 8, 'score' => 4],
            ['domain_a' => 3, 'domain_b' => 9, 'score' => 5],
            ['domain_a' => 3, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 3, 'domain_b' => 11, 'score' => 3],
            ['domain_a' => 3, 'domain_b' => 12, 'score' => 4],

            // 4 Education
            ['domain_a' => 4, 'domain_b' => 1, 'score' => 4],
            ['domain_a' => 4, 'domain_b' => 2, 'score' => 3],
            ['domain_a' => 4, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 4, 'domain_b' => 5, 'score' => 4],
            ['domain_a' => 4, 'domain_b' => 6, 'score' => 5],
            ['domain_a' => 4, 'domain_b' => 7, 'score' => 4],
            ['domain_a' => 4, 'domain_b' => 8, 'score' => 3],
            ['domain_a' => 4, 'domain_b' => 9, 'score' => 3],
            ['domain_a' => 4, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 4, 'domain_b' => 11, 'score' => 2],
            ['domain_a' => 4, 'domain_b' => 12, 'score' => 4],

            // 5 Health Sciences
            ['domain_a' => 5, 'domain_b' => 1, 'score' => 4],
            ['domain_a' => 5, 'domain_b' => 2, 'score' => 4],
            ['domain_a' => 5, 'domain_b' => 3, 'score' => 3],
            ['domain_a' => 5, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 5, 'domain_b' => 6, 'score' => 3],
            ['domain_a' => 5, 'domain_b' => 7, 'score' => 5],
            ['domain_a' => 5, 'domain_b' => 8, 'score' => 3],
            ['domain_a' => 5, 'domain_b' => 9, 'score' => 2],
            ['domain_a' => 5, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 5, 'domain_b' => 11, 'score' => 2],
            ['domain_a' => 5, 'domain_b' => 12, 'score' => 2],

            // 6 Arts & Humanities
            ['domain_a' => 6, 'domain_b' => 1, 'score' => 3],
            ['domain_a' => 6, 'domain_b' => 2, 'score' => 2],
            ['domain_a' => 6, 'domain_b' => 3, 'score' => 3],
            ['domain_a' => 6, 'domain_b' => 4, 'score' => 5],
            ['domain_a' => 6, 'domain_b' => 5, 'score' => 3],
            ['domain_a' => 6, 'domain_b' => 7, 'score' => 2],
            ['domain_a' => 6, 'domain_b' => 8, 'score' => 1],
            ['domain_a' => 6, 'domain_b' => 9, 'score' => 4],
            ['domain_a' => 6, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 6, 'domain_b' => 11, 'score' => 1],
            ['domain_a' => 6, 'domain_b' => 12, 'score' => 5],

            // 7 Sciences & Mathematics
            ['domain_a' => 7, 'domain_b' => 1, 'score' => 5],
            ['domain_a' => 7, 'domain_b' => 2, 'score' => 5],
            ['domain_a' => 7, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 7, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 7, 'domain_b' => 5, 'score' => 5],
            ['domain_a' => 7, 'domain_b' => 6, 'score' => 2],
            ['domain_a' => 7, 'domain_b' => 8, 'score' => 4],
            ['domain_a' => 7, 'domain_b' => 9, 'score' => 2],
            ['domain_a' => 7, 'domain_b' => 10, 'score' => 3],
            ['domain_a' => 7, 'domain_b' => 11, 'score' => 4],
            ['domain_a' => 7, 'domain_b' => 12, 'score' => 4],

            // 8 Agriculture & Fisheries
            ['domain_a' => 8, 'domain_b' => 1, 'score' => 3],
            ['domain_a' => 8, 'domain_b' => 2, 'score' => 4],
            ['domain_a' => 8, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 8, 'domain_b' => 4, 'score' => 3],
            ['domain_a' => 8, 'domain_b' => 5, 'score' => 3],
            ['domain_a' => 8, 'domain_b' => 6, 'score' => 1],
            ['domain_a' => 8, 'domain_b' => 7, 'score' => 4],
            ['domain_a' => 8, 'domain_b' => 9, 'score' => 3],
            ['domain_a' => 8, 'domain_b' => 10, 'score' => 3],
            ['domain_a' => 8, 'domain_b' => 11, 'score' => 4],
            ['domain_a' => 8, 'domain_b' => 12, 'score' => 2],

            // 9 Hospitality / Tourism
            ['domain_a' => 9, 'domain_b' => 1, 'score' => 3],
            ['domain_a' => 9, 'domain_b' => 2, 'score' => 2],
            ['domain_a' => 9, 'domain_b' => 3, 'score' => 5],
            ['domain_a' => 9, 'domain_b' => 4, 'score' => 3],
            ['domain_a' => 9, 'domain_b' => 5, 'score' => 2],
            ['domain_a' => 9, 'domain_b' => 6, 'score' => 4],
            ['domain_a' => 9, 'domain_b' => 7, 'score' => 2],
            ['domain_a' => 9, 'domain_b' => 8, 'score' => 3],
            ['domain_a' => 9, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 9, 'domain_b' => 11, 'score' => 3],
            ['domain_a' => 9, 'domain_b' => 12, 'score' => 4],

            // 10 Law / Security / Public Service
            ['domain_a' => 10, 'domain_b' => 1, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 2, 'score' => 3],
            ['domain_a' => 10, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 5, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 6, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 7, 'score' => 3],
            ['domain_a' => 10, 'domain_b' => 8, 'score' => 3],
            ['domain_a' => 10, 'domain_b' => 9, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 11, 'score' => 4],
            ['domain_a' => 10, 'domain_b' => 12, 'score' => 2],

            // 11 Maritime
            ['domain_a' => 11, 'domain_b' => 1, 'score' => 3],
            ['domain_a' => 11, 'domain_b' => 2, 'score' => 5],
            ['domain_a' => 11, 'domain_b' => 3, 'score' => 3],
            ['domain_a' => 11, 'domain_b' => 4, 'score' => 2],
            ['domain_a' => 11, 'domain_b' => 5, 'score' => 2],
            ['domain_a' => 11, 'domain_b' => 6, 'score' => 1],
            ['domain_a' => 11, 'domain_b' => 7, 'score' => 4],
            ['domain_a' => 11, 'domain_b' => 8, 'score' => 4],
            ['domain_a' => 11, 'domain_b' => 9, 'score' => 3],
            ['domain_a' => 11, 'domain_b' => 10, 'score' => 4],
            ['domain_a' => 11, 'domain_b' => 12, 'score' => 3],

            // 12 Fine Arts / Design / Architecture
            ['domain_a' => 12, 'domain_b' => 1, 'score' => 4],
            ['domain_a' => 12, 'domain_b' => 2, 'score' => 5],
            ['domain_a' => 12, 'domain_b' => 3, 'score' => 4],
            ['domain_a' => 12, 'domain_b' => 4, 'score' => 4],
            ['domain_a' => 12, 'domain_b' => 5, 'score' => 2],
            ['domain_a' => 12, 'domain_b' => 6, 'score' => 5],
            ['domain_a' => 12, 'domain_b' => 7, 'score' => 4],
            ['domain_a' => 12, 'domain_b' => 8, 'score' => 2],
            ['domain_a' => 12, 'domain_b' => 9, 'score' => 4],
            ['domain_a' => 12, 'domain_b' => 10, 'score' => 2],
            ['domain_a' => 12, 'domain_b' => 11, 'score' => 3],
        ]);
    }
}