<?php

namespace App\Services;

use App\Models\Faculty;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Subject;
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
        $timeslots = TimeSlot::all();

        $candidates = [];

        foreach ($subjects as $subject) {

            $sessions = max(1, $subject['sessions_needed']);

            // 🔥 filter VALID rooms only
            $validRooms = $rooms->filter(function ($room) use ($subject) {
                if (empty($subject['room_type'])) return true;
                return strtolower($room->type) === strtolower($subject['room_type']);
            });

            // fallback if none matched
            if ($validRooms->isEmpty()) {
                $validRooms = $rooms;
            }

            // 🔥 OPTIONAL: shuffle to avoid same patterns
            $validRooms = $validRooms->shuffle();
            $teachers = $teachers->shuffle();
            $timeslots = $timeslots->shuffle();

            foreach (range(0, $sessions - 1) as $i) {

                $countPerSession = 0;

                foreach ($teachers as $teacher) {
                    foreach ($validRooms as $room) {
                        foreach ($timeslots as $slot) {

                            // 🔥 OPTIONAL SHIFT FILTER
                            if (
                                !empty($subject['preferred_shift']) &&
                                $slot->shift !== $subject['preferred_shift']
                            ) {
                                continue;
                            }

                            $candidates[] = [
                                'section_id' => $section->id,
                                'subject_id' => $subject['subject_id'],
                                'session_index' => $i,

                                'faculty_id' => $teacher->id,
                                'room_id' => $room->id,
                                'timeslot_id' => $slot->id,

                                'score' => 1,
                            ];

                            $countPerSession++;

                            // 🔥 KEY LIMIT (PER SESSION, NOT GLOBAL)
                            if ($countPerSession >= 30) {
                                break 3;
                            }
                        }
                    }
                }
            }
        }

        logger()->info('Candidates built', [
            'section_id' => $section->id,
            'count' => count($candidates)
        ]);

        return $candidates;
    }
    private function isValid($subject, $teacher, $room, $slot): bool
    {
        // 🔥 TEMP DISABLE ALL STRICT FILTERS FOR DEBUG
        return true;
    }
}
