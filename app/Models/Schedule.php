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
    protected $guarded = [];

    // ✅ Version
    public function version()
    {
        return $this->belongsTo(ScheduleVersion::class, 'schedule_version_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function timeslot()
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
