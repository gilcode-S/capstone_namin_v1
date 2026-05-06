<?php

namespace Database\Seeders;

use App\Models\Domain;
use App\Models\DomainGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DomainSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data to avoid duplicates if run multiple times
        Domain::query()->delete();
        DomainGroup::query()->delete();

        $data = [
            'Computer Studies / IT' => [
                'Computer Science',
                'Information Technology',
                'Information Systems',
                'Software Engineering',
                'Data Science'
            ],
            'Engineering' => [
                'Civil Engineering',
                'Mechanical Engineering',
                'Electrical Engineering',
                'Electronics Engineering',
                'Computer Engineering',
                'Industrial Engineering',
                'Chemical Engineering'
            ],
            'Business & Accountancy' => [
                'Accountancy',
                'Business Administration',
                'Financial Management',
                'Marketing Management',
                'Human Resource Management',
                'Entrepreneurship',
                'Office Administration'
            ],
            'Education' => [
                'Secondary Education',
                'Elementary Education',
                'Special Education',
                'Physical Education'
            ],
            'Health Sciences' => [
                'Nursing',
                'Pharmacy',
                'Medical Technology',
                'Public Health',
                'Physical Therapy',
                'Biology (Pre-Med)'
            ],
            'Arts & Humanities' => [
                'English Language / Literature',
                'Communication',
                'Journalism',
                'Philosophy',
                'History',
                'Political Science',
                'Sociology',
                'Psychology',
                'Philippine Studies / Rizal',
                'Ethics' // Added for common GenEd Minor subjects
            ],
            'Sciences & Mathematics' => [
                'Mathematics',
                'Applied Mathematics',
                'Physics',
                'Chemistry',
                'Biology',
                'Environmental Science'
            ],
            'Agriculture & Fisheries' => [
                'Agriculture',
                'Agricultural Engineering',
                'Fisheries',
                'Food Technology',
                'Forestry'
            ],
            'Hospitality / Tourism' => [
                'Hospitality Management',
                'Tourism Management',
                'Culinary Arts'
            ],
            'Law / Security / Public Service' => [
                'Criminology',
                'Legal Management',
                'Juris Doctor (Law)'
            ],
            'Maritime' => [
                'Marine Engineering',
                'Marine Transportation'
            ],
            'Fine Arts / Design / Architecture' => [
                'Architecture',
                'Fine Arts',
                'Industrial Design',
                'Multimedia Arts'
            ],
        ];

        // Loop through the array and insert into the database
        foreach ($data as $groupName => $domains) {
            // 1. Create the Domain Group
            $group = DomainGroup::create(['name' => $groupName]);

            // 2. Create all Domains under this group
            foreach ($domains as $domainName) {
                Domain::create([
                    'domain_group_id' => $group->id,
                    'name' => $domainName
                ]);
            }
        }
    }
}
