<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Schedule;
use App\Models\Room;       // Add this
use App\Models\Timeslot;   // Add this
use App\Models\Section;    // Add this
class GeneratorService
{
    public function generate($versionId)
    {
        // 1. SORT BY YEAR LEVEL (Seniority First)
        // 4th-year subjects get processed first, picking the best teachers.
        $subjects = Subject::orderBy('year_level', 'desc')->get();

        foreach ($subjects as $subject) {
            $assignedTeacher = null;
            $isFallback = false;

            // Phase 1: IDEAL SEARCH (Competency + Workload + Year Level Matching)
            $availableTeachers = Teacher::where('available', true)
                ->where('current_hours', '<', 'max_hours')
                ->get();

            $bestScore = -1;

            foreach ($availableTeachers as $teacher) {
                $score = 0;

                // Domain Match (Hard Requirement for Phase 1)
                if (!$teacher->hasDomain($subject->domain_id)) {
                    continue;
                }
                $score += 50;

                // SENIORITY MATCHING (The Advanced Algorithm Rule)
                if ($subject->year_level == 4 && $teacher->rank == 'Senior') {
                    $score += 40; // Best teachers for graduating students
                } elseif ($subject->year_level == 1 && $teacher->rank == 'Junior') {
                    $score += 40; // Junior teachers for introductory classes
                }

                if ($score > $bestScore) {
                    $bestScore = $score;
                    $assignedTeacher = $teacher;
                }
            }

            // Phase 2: GRACEFUL DEGRADATION (The Orange Fallback)
            if (!$assignedTeacher) {
                $isFallback = true;

                if ($subject->type === 'Minor') {
                    // Desperation 1: Grab literally any available teacher
                    $assignedTeacher = Teacher::where('available', true)->first();
                } else {
                    // Desperation 2: Grab a competent teacher even if they hit Overtime
                    $assignedTeacher = Teacher::where('available', true)
                        ->whereHas('domain', function ($q) use ($subject) {
                            $q->where('id', $subject->domain_id);
                        })->first();
                }
            }

            // Phase 3: COMMIT TO DATABASE
            if ($assignedTeacher) {

                $room = Room::inRandomOrder()->first();
                $timeslot = Timeslot::inRandomOrder()->first();
                $section = Section::inRandomOrder()->first();
                if ($room && $timeslot && $section) {
                    Schedule::create([
                        'schedule_version_id' => $versionId,
                        'subject_id' => $subject->id,
                        'teacher_id' => $assignedTeacher->id,
                        'room_id' => $room->id,            // FIXED: Now we provide the Room
                        'timeslot_id' => $timeslot->id,    // FIXED: Now we provide the Time
                        'section_id' => $section->id,      // FIXED: Now we provide the Section
                        'is_fallback' => $isFallback
                    ]);

                    // Update teacher's workload
                    $assignedTeacher->increment('current_hours', $subject->units);
                }
            }
        }
    }
}
