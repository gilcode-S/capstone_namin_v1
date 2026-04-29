<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ScheduleVersion;
use App\Models\Faculty;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Room;
use App\Models\TimeSlot;

class Schedule extends Model
{
    protected $fillable = [
        'schedule_version_id',
        'section_id',
        'subject_id',
        'faculty_id',
        'room_id',
        'time_slot_id',
        'set_type',
        'score',
        'status'
    ];

    // ✅ Version
    public function version()
    {
        return $this->belongsTo(
            ScheduleVersion::class,
            'schedule_version_id',
            'id'
        );
    }

    // ✅ Faculty (teacher)
    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'id');
    }

    // ✅ Subject
    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id', 'id');
    }

    // ✅ Section
    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'id');
    }

    // ✅ Room
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id', 'id');
    }

    // ✅ Time slot
    public function timeslot()
    {
        return $this->belongsTo(TimeSlot::class, 'time_slot_id', 'id');
    }
}
