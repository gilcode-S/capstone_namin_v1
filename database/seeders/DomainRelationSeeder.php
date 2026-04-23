<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainRelationSeeder extends Seeder
{
    public function run()
    {
        DB::table('domain_relations')->insert([

            // ======================
            // COMPUTER STUDIES CORE
            // ======================
            ['domain_a' => 'Computer Science', 'domain_b' => 'Information Technology', 'score' => 0.95],
            ['domain_a' => 'Computer Science', 'domain_b' => 'Software Engineering', 'score' => 0.98],
            ['domain_a' => 'Computer Science', 'domain_b' => 'Data Science', 'score' => 0.90],
            ['domain_a' => 'Information Technology', 'domain_b' => 'Software Engineering', 'score' => 0.92],

            // ======================
            // ENGINEERING RELATIONS
            // ======================
            ['domain_a' => 'Civil Engineering', 'domain_b' => 'Mechanical Engineering', 'score' => 0.60],
            ['domain_a' => 'Electrical Engineering', 'domain_b' => 'Electronics Engineering', 'score' => 0.95],
            ['domain_a' => 'Computer Engineering', 'domain_b' => 'Computer Science', 'score' => 0.88],

            // ======================
            // BUSINESS RELATIONS
            // ======================
            ['domain_a' => 'Business Administration', 'domain_b' => 'Marketing Management', 'score' => 0.85],
            ['domain_a' => 'Business Administration', 'domain_b' => 'Human Resource Management', 'score' => 0.80],

            // ======================
            // HEALTH SCIENCES
            // ======================
            ['domain_a' => 'Nursing', 'domain_b' => 'Public Health', 'score' => 0.85],
            ['domain_a' => 'Biology', 'domain_b' => 'Medical Technology', 'score' => 0.75],

            // ======================
            // ARTS & SOCIAL SCIENCE
            // ======================
            ['domain_a' => 'Psychology', 'domain_b' => 'Sociology', 'score' => 0.90],
            ['domain_a' => 'Political Science', 'domain_b' => 'History', 'score' => 0.80],

            // ======================
            // SCIENCE
            // ======================
            ['domain_a' => 'Mathematics', 'domain_b' => 'Physics', 'score' => 0.95],
            ['domain_a' => 'Chemistry', 'domain_b' => 'Biology', 'score' => 0.85],

            // ======================
            // DEFAULT CROSS RELATION (LOW SCORE)
            // ======================
            ['domain_a' => 'Computer Science', 'domain_b' => 'Business Administration', 'score' => 0.30],
            ['domain_a' => 'Engineering', 'domain_b' => 'Arts & Humanities', 'score' => 0.20],
        ]);
    }
}