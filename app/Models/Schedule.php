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
        'version_id',
        'subject_id',
        'teacher_id',
        'section_id',
        'room_id',
        'day',
        'timeslot',
        'set_type',
        'is_online',
        'meeting_group',
        'domain_score',
        'teacher_score',
        'cp_sat_weight',
        'conflict_type'
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
    public function teacher()
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
