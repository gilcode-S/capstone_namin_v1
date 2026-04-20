<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ScheduleVersion;
use App\Models\Room;
use App\Models\SectionSubjectAssignment;
use App\Models\TimeSlot;

class Schedule extends Model
{
    //
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


    public function version()
    {
        return $this->belongsTo(ScheduleVersion::class, 'schedule_version_id');
    }


    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function timeslot()
    {
        return $this->belongsTo(TimeSlot::class, 'time_slot_id');
    }
}
