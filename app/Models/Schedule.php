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
        'score',
        'status'
    ];

    // ✅ Version
    public function version()
    {
        return $this->belongsTo(ScheduleVersion::class, 'schedule_version_id');
    }

    // ✅ Faculty (teacher)
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    // ✅ Subject
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    // ✅ Section
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    // ✅ Room
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    // ✅ Time slot
    public function timeslot()
    {
        return $this->belongsTo(TimeSlot::class, 'time_slot_id');
    }
}