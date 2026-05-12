<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    //
    use SoftDeletes;
    protected $guarded = [];

    // This tells Laravel to automatically convert JSON strings to PHP Arrays
    protected $casts = [
        'availability_days' => 'array',
        'shift_preferences' => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
    public function domain()
    {
        return $this->belongsTo(Domain::class, 'specialization_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }


    public function requiredTeacher()
    {
        return $this->belongsTo(Teacher::class, 'req_teacher_id');
    }

    public function requiredRoom()
    {
        return $this->belongsTo(Room::class, 'req_room_id');
    }


    public function domainGroup()
    {
        return $this->belongsTo(DomainGroup::class);
    }
    public function specialization()
    {
        return $this->belongsTo(Domain::class, 'specialization_id');
    }
    public function getIsOverloadedAttribute()
    {
        return $this->current_hours > $this->max_hours;
    }
}
