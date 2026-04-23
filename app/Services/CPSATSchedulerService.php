<?php

namespace App\Services;

use App\Models\ClassUnit;
use App\Models\Faculty;
use App\Models\Room;
use App\Models\TimeSlot;
use App\Models\Schedule;
use App\Services\DomainScoringService;

class CPSATSchedulerService
{
    protected $scoring;

    public function __construct(DomainScoringService $scoring)
    {
        $this->scoring = $scoring;
    }

    public function generateSchedule($versionId)
    {
        $units = ClassUnit::where('status', 'generated')->get();
        $teachers = Faculty::all(); // still Faculty model
        $rooms = Room::all();
        $timeslots = TimeSlot::all();

        $candidates = $this->buildCandidates($units, $teachers, $rooms, $timeslots);

        $filtered = $this->applyHardConstraints($candidates);

        $optimized = $this->runOptimization($filtered);

        return $this->saveSchedule($optimized, $versionId);
    }

    private function buildCandidates($units, $teachers, $rooms, $timeslots)
    {
        $candidates = [];

        foreach ($units as $unit) {
            foreach ($teachers as $teacher) {
                foreach ($rooms as $room) {
                    foreach ($timeslots as $slot) {

                        $score = $this->scoring->calculateTeacherScore(
                            $teacher,
                            $unit->subject
                        );

                        $candidates[] = [
                            'unit_id' => $unit->id,
                            'teacher_id' => $teacher->id,
                            'room_id' => $room->id,
                            'timeslot_id' => $slot->id,
                            'score' => $score,
                        ];
                    }
                }
            }
        }

        return $candidates;
    }

    private function applyHardConstraints($candidates)
    {
        return array_filter($candidates, function ($c) {

            if ($this->isTeacherBusy($c['teacher_id'], $c['timeslot_id'])) {
                return false;
            }

            if ($this->isRoomBusy($c['room_id'], $c['timeslot_id'])) {
                return false;
            }

            if ($this->exceedsWorkload($c['teacher_id'])) {
                return false;
            }

            return true;
        });
    }

    private function runOptimization($candidates)
    {
        usort($candidates, fn($a, $b) => $b['score'] <=> $a['score']);

        $selected = [];
        $usedTeachers = [];
        $usedRooms = [];
        $usedSlots = [];

        foreach ($candidates as $c) {

            if (
                in_array($c['teacher_id'], $usedTeachers) ||
                in_array($c['room_id'], $usedRooms) ||
                in_array($c['timeslot_id'], $usedSlots)
            ) {
                continue;
            }

            $selected[] = $c;

            $usedTeachers[] = $c['teacher_id'];
            $usedRooms[] = $c['room_id'];
            $usedSlots[] = $c['timeslot_id'];
        }

        return $selected;
    }

    private function saveSchedule($optimized, $versionId)
    {
        foreach ($optimized as $item) {

            Schedule::create([
                'section_id' => $this->getSectionFromUnit($item['unit_id']),
                'subject_id' => $this->getSubjectFromUnit($item['unit_id']),
                'teacher_id' => $item['teacher_id'], // KEEP THIS
                'room_id' => $item['room_id'],
                'timeslot_id' => $item['timeslot_id'],
                'version_id' => $versionId,
                'set_type' => 'A',
                'score' => $item['score'],
                'status' => 'active'
            ]);
        }
    }

    private function isTeacherBusy($teacherId, $slotId)
    {
        return Schedule::where('teacher_id', $teacherId)
            ->where('timeslot_id', $slotId)
            ->exists();
    }

    private function isRoomBusy($roomId, $slotId)
    {
        return Schedule::where('room_id', $roomId)
            ->where('timeslot_id', $slotId)
            ->exists();
    }

    private function exceedsWorkload($teacherId)
    {
        return Schedule::where('teacher_id', $teacherId)->count() > 40;
    }

    private function getSectionFromUnit($unitId)
    {
        return ClassUnit::find($unitId)->section_id;
    }

    private function getSubjectFromUnit($unitId)
    {
        return ClassUnit::find($unitId)->subject_id;
    }
}