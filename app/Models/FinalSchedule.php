<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinalSchedule extends Model
{
    protected $fillable = [
        'schedule_version_id',
        'section_id',
        'subject_id',
        'faculty_id',
        'room_id',
        'time_slot_id',
        'set_type',
        'is_online'
    ];
}
