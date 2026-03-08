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
        'assignment_id',
        'room_id',
        'time_slot_id'
    ];


    public function version() 
    {
        return $this->belongsTo(ScheduleVersion::class, 'schedule_version_id');
    }


    public function assignment()
    {
        return $this->belongsTo(SectionSubjectAssignment::class, 'assignment_id');
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
