<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Room;
use App\Models\Timeslot;
use App\Services\DomainScoringService;

class ScheduleCandidateBuilderService
{
    protected DomainScoringService $scoring;

    public function __construct(DomainScoringService $scoring)
    {
        $this->scoring = $scoring;
    }

    public function build($section, $subjects)
    {
        $teachers = Faculty::where('status', 'active')->get();
        $rooms = Room::all();
        $timeslots = Timeslot::where('shift', $section->shift)->get();

        $candidates = [];

        foreach ($subjects as $subject) {

            $sessions = $subject['sessions_needed'] ?? 1;

            for ($i = 0; $i < $sessions; $i++) {

                foreach ($teachers as $teacher) {
                    foreach ($rooms as $room) {
                        foreach ($timeslots as $slot) {

                            if (!$this->isValid($subject, $teacher, $room, $slot)) {
                                continue;
                            }

                            $score = $this->scoring
                                ->calculateTeacherScore($teacher, (object)$subject);

                            $candidates[] = [
                                'section_id' => $section->id,
                                'subject_id' => $subject['subject_id'],

                                'session_index' => $i,

                                'teacher_id' => $teacher->id,
                                'room_id' => $room->id,
                                'timeslot_id' => $slot->id,

                                'score' => $score,
                            ];
                        }
                    }
                }
            }
        }

        return $candidates;
    }

    private function isValid($subject, $teacher, $room, $slot): bool
    {
        // ROOM TYPE CHECK
        if (($subject['room_type'] ?? null) !== $room->type) {
            return false;
        }

        // SHIFT CHECK
        if (!empty($subject['preferred_shift'])) {
            if ($slot->shift !== $subject['preferred_shift']) {
                return false;
            }
        }

        // DAY CHECK
        if (!empty($subject['preferred_day'])) {
            if ($slot->day !== $subject['preferred_day']) {
                return false;
            }
        }

        // PREFERRED TEACHER
        if (!empty($subject['preferred_teacher_id'])) {
            if ($subject['preferred_teacher_id'] != $teacher->id) {
                return false;
            }
        }

        return true;
    }
}