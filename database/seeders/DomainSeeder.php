<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('domain_groups')->insert([
            ['id' => 1, 'name' => 'Computer Studies / IT'],
            ['id' => 2, 'name' => 'Engineering'],
            ['id' => 3, 'name' => 'Business & Accountancy'],
            ['id' => 4, 'name' => 'Education'],
            ['id' => 5, 'name' => 'Health Sciences'],
            ['id' => 6, 'name' => 'Arts & Humanities'],
            ['id' => 7, 'name' => 'Sciences & Mathematics'],
            ['id' => 8, 'name' => 'Agriculture & Fisheries'],
            ['id' => 9, 'name' => 'Hospitality / Tourism'],
            ['id' => 10, 'name' => 'Law / Security / Public Service'],
            ['id' => 11, 'name' => 'Maritime'],
            ['id' => 12, 'name' => 'Fine Arts / Design / Architecture'],
        ]);

        DB::table('domains')->insert([
            // COMPUTER STUDIES
            ['domain_group_id' => 1, 'name' => 'Computer Science'],
            ['domain_group_id' => 1, 'name' => 'Information Technology'],
            ['domain_group_id' => 1, 'name' => 'Information Systems'],
            ['domain_group_id' => 1, 'name' => 'Software Engineering'],
            ['domain_group_id' => 1, 'name' => 'Data Science'],
            ['domain_group_id' => 1, 'name' => 'Computer Engineering'],

            // ENGINEERING
            ['domain_group_id' => 2, 'name' => 'Civil Engineering'],
            ['domain_group_id' => 2, 'name' => 'Mechanical Engineering'],
            ['domain_group_id' => 2, 'name' => 'Electrical Engineering'],
            ['domain_group_id' => 2, 'name' => 'Electronics Engineering'],
            ['domain_group_id' => 2, 'name' => 'Industrial Engineering'],
            ['domain_group_id' => 2, 'name' => 'Chemical Engineering'],

            // BUSINESS
            ['domain_group_id' => 3, 'name' => 'Accountancy'],
            ['domain_group_id' => 3, 'name' => 'Business Administration'],
            ['domain_group_id' => 3, 'name' => 'Financial Management'],
            ['domain_group_id' => 3, 'name' => 'Marketing Management'],
            ['domain_group_id' => 3, 'name' => 'Human Resource Management'],
            ['domain_group_id' => 3, 'name' => 'Entrepreneurship'],
            ['domain_group_id' => 3, 'name' => 'Office Administration'],

            // EDUCATION
            ['domain_group_id' => 4, 'name' => 'Secondary Education'],
            ['domain_group_id' => 4, 'name' => 'Elementary Education'],
            ['domain_group_id' => 4, 'name' => 'Special Education'],
            ['domain_group_id' => 4, 'name' => 'Physical Education'],

            // HEALTH
            ['domain_group_id' => 5, 'name' => 'Nursing'],
            ['domain_group_id' => 5, 'name' => 'Pharmacy'],
            ['domain_group_id' => 5, 'name' => 'Medical Technology'],
            ['domain_group_id' => 5, 'name' => 'Public Health'],
            ['domain_group_id' => 5, 'name' => 'Physical Therapy'],
            ['domain_group_id' => 5, 'name' => 'Biology'],

            // ARTS
            ['domain_group_id' => 6, 'name' => 'Communication'],
            ['domain_group_id' => 6, 'name' => 'Journalism'],
            ['domain_group_id' => 6, 'name' => 'Philosophy'],
            ['domain_group_id' => 6, 'name' => 'Psychology'],

            // SCIENCE
            ['domain_group_id' => 7, 'name' => 'Mathematics'],
            ['domain_group_id' => 7, 'name' => 'Physics'],
            ['domain_group_id' => 7, 'name' => 'Chemistry'],
            ['domain_group_id' => 7, 'name' => 'Biology'],

            // AGRICULTURE
            ['domain_group_id' => 8, 'name' => 'Agriculture'],
            ['domain_group_id' => 8, 'name' => 'Fisheries'],
            ['domain_group_id' => 8, 'name' => 'Food Technology'],

            // HOSPITALITY
            ['domain_group_id' => 9, 'name' => 'Hospitality Management'],
            ['domain_group_id' => 9, 'name' => 'Tourism Management'],
            ['domain_group_id' => 9, 'name' => 'Culinary Arts'],

            // LAW
            ['domain_group_id' => 10, 'name' => 'Criminology'],
            ['domain_group_id' => 10, 'name' => 'Legal Management'],

            // MARITIME
            ['domain_group_id' => 11, 'name' => 'Marine Engineering'],
            ['domain_group_id' => 11, 'name' => 'Marine Transportation'],

            // FINE ARTS
            ['domain_group_id' => 12, 'name' => 'Architecture'],
            ['domain_group_id' => 12, 'name' => 'Fine Arts'],
            ['domain_group_id' => 12, 'name' => 'Multimedia Arts'],
        ]);
    }
}