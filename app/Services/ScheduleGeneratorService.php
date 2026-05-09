<?php

namespace App\Services;

use App\Models\Section;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Room;
use App\Models\Timeslot;
use App\Models\Schedule; // Assuming you make a Schedule model for the final output
use App\Models\CurriculumSubject;
use Illuminate\Support\Facades\DB;

class ScheduleGeneratorService
{
    /**
     * PAGE 10: THE PRE-PROCESSING ENGINE (COMPETENCY MATCHING)
     * This ranks teachers for a specific subject based on their domains and department.
     */
    public function rankTeachersForSubject(Subject $subject, Section $section)
    {
        // 1. Get all teachers
        $teachers = Teacher::all();
        $rankedTeachers = [];

        foreach ($teachers as $teacher) {
            $score = 0;
            $isQualified = false;

            // COMPETENCY CHECK: Major Subject (Strict Department Check)
            if ($subject->type === 'Major') {
                if ($teacher->department_id === $subject->program->department_id) {
                    $score += 50; // Huge point boost for matching department
                    $isQualified = true;
                }
            }
            // COMPETENCY CHECK: Minor Subject (Domain Check)
            else {
                if ($teacher->domainGroup && $teacher->domainGroup->domains->contains('id', $subject->domain_id)) {
                    $score += 40;
                    $isQualified = true;
                }
            }

            // SHIFT PREFERENCE CHECK (Soft Constraint)
            // Does the teacher prefer the shift that this section is in?
            $teacherShifts = $teacher->shift_preferences ?? [];
            if (in_array($section->shift, $teacherShifts)) {
                $score += 20;
            }

            // HARD CONSTRAINT FILTER: Skip unqualified teachers entirely
            if (!$isQualified) {
                continue;
            }

            // Add to our ranked array
            $rankedTeachers[] = [
                'teacher' => $teacher,
                'score' => $score
            ];
        }

        // Sort the array by score, highest first
        usort($rankedTeachers, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return collect($rankedTeachers)->pluck('teacher');
    }


    /**
     * PAGE 11: THE GREEDY CONSTRUCTOR ALGORITHM
     * Takes a specific section, finds its curriculum, and builds the schedule.
     */
    public function generateScheduleForSection(Section $section, $versionId)
    {
        // 1. Get the subjects this section needs from the Curriculum Guide
        $curriculumSubjects = CurriculumSubject::where('program_id', $section->program_id)
            ->where('year_level', $section->year_level)
            ->where('semester', $section->semester)
            ->with('subject')
            ->get();

        // 2. Get available Timeslots for this section's shift (e.g., Only Morning slots)
        $availableTimeslots = Timeslot::where('shift', $section->shift)->get();

        // 3. Get all face-to-face rooms
        $rooms = Room::where('type', '!=', 'Online')->get();

        $generatedSchedule = [];

        // START THE GREEDY LOOP
        foreach ($curriculumSubjects as $curriculum) {
            $subject = $curriculum->subject;
            $unitsToSchedule = $subject->units;

            // Get our pre-processed, ranked list of competent teachers
            $rankedTeachers = $this->rankTeachersForSubject($subject, $section);

            // If no competent teacher exists, we must flag an error for the admin
            if ($rankedTeachers->isEmpty()) {
                throw new \Exception("No competent teacher found for Subject: " . $subject->name);
            }

            // Grab the #1 ranked teacher
            $assignedTeacher = $rankedTeachers->first();

            // Loop to assign timeslots based on Subject Units (e.g., 3 units = 3 timeslots)
            $scheduledUnits = 0;

            foreach ($availableTimeslots as $timeslot) {
                if ($scheduledUnits >= $unitsToSchedule) break; // Finished scheduling this subject

                // HARD CONSTRAINTS CHECK
                if ($this->hasConflict($timeslot->id, $assignedTeacher->id, $section->id)) {
                    continue; // Skip this timeslot, someone is busy
                }

                if ($this->isBreakingFourHourRule($timeslot, $assignedTeacher->id)) {
                    continue; // Skip, teacher needs a 1-hour break
                }

                // Find a room that isn't booked at this timeslot
                $availableRoom = $this->findAvailableRoom($timeslot->id, $rooms, $subject);

                if ($availableRoom) {
                    // Lock it in!
                    $newScheduleBlock = [
                        'schedule_version_id' => $versionId,
                        'section_id' => $section->id,
                        'subject_id' => $subject->id,
                        'teacher_id' => $assignedTeacher->id,
                        'room_id' => $availableRoom->id,
                        'timeslot_id' => $timeslot->id,
                      
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    // Insert into DB immediately to prevent conflicts with the next loop
                    DB::table('schedules')->insert($newScheduleBlock);
                    $scheduledUnits++;
                }
            }

            if ($scheduledUnits < $unitsToSchedule) {
                // The algorithm ran out of rooms or timeslots for this shift!
                throw new \Exception("Could not fully schedule " . $subject->name . ". Not enough resources.");
            }
        }

        return true; // Success!
    }

    /**
     * CONFLICT DETECTOR: Ensures Teacher and Section aren't double-booked
     */
    private function hasConflict($timeslotId, $teacherId, $sectionId)
    {
        return DB::table('schedules')
            ->where('timeslot_id', $timeslotId)
            ->where(function ($query) use ($teacherId, $sectionId) {
                $query->where('teacher_id', $teacherId)
                    ->orWhere('section_id', $sectionId);
            })->exists();
    }

    /**
     * FATIGUE DETECTOR: The 4-Hour Rule
     * Checks if the teacher is teaching 4 consecutive hours right before this slot.
     */
    private function isBreakingFourHourRule($timeslot, $teacherId)
    {
        // For a 1-day MVP build, we keep this simple.
        // In reality, you query the schedule to see if the teacher has 4 consecutive 
        // timeslots on the exact same `day` immediately prior to $timeslot->start_time.
        // If true, return true to force a skip.

        return false; // Set to true when fully implemented
    }

    /**
     * ROOM FINDER: Grabs an empty room based on subject needs
     */
    private function findAvailableRoom($timeslotId, $rooms, $subject)
    {
        $bookedRoomIds = DB::table('schedules')->where('timeslot_id', $timeslotId)->pluck('room_id')->toArray();

        foreach ($rooms as $room) {
            if (!in_array($room->id, $bookedRoomIds)) {

                // If it's a PE subject, it needs a PE room.
                if (str_contains(strtolower($subject->name), 'pe') && $room->type !== 'PE') {
                    continue;
                }

                // If it's a computer lab subject, it needs a Lab.
                if (str_contains(strtolower($subject->name), 'programming') && $room->type !== 'Lab') {
                    continue;
                }

                return $room; // We found a valid, empty room!
            }
        }
        return null;
    }
}
