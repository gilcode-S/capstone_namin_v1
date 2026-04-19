<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainRelationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('domain_relations')->insert([
            ['domain_a' => 'Programming', 'domain_b' => 'Web Development', 'score' => 0.9],
            ['domain_a' => 'Programming', 'domain_b' => 'Software Engineering', 'score' => 0.95],
            ['domain_a' => 'Networking', 'domain_b' => 'IT', 'score' => 0.85],
            ['domain_a' => 'Database', 'domain_b' => 'Data Science', 'score' => 0.8],
            ['domain_a' => 'AI', 'domain_b' => 'Data Science', 'score' => 0.9],
        ]);
    }
}
