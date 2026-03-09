<?php

namespace Database\Seeders;

use App\Models\Faculty;
use App\Models\Programs;
use App\Models\ScheduleVersion;
use App\Models\Section;
use App\Models\SectionSubjectAssignment;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class AssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $scheduleVersions = ScheduleVersion::all();
        if ($scheduleVersions->isEmpty()) {
            $this->command->error("No schedule versions found! Run ScheduleVersionSeeder first.");
            return;
        }

        $sections = Section::all();
        $subjects = Subject::all();
        $faculties = Faculty::all();

        foreach ($sections as $section) {
            $assignedSubjects = $subjects->where('program_id', $section->program_id)->random(rand(3, 6));

            foreach ($assignedSubjects as $subject) {
                SectionSubjectAssignment::create([
                    'schedule_version_id' => $scheduleVersions->random()->id,
                    'section_id' => $section->id,
                    'subject_id' => $subject->id,
                    'faculty_id' => $faculties->random()->id,
                ]);
            }
        }
    }
}