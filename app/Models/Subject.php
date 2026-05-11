<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Programs;
use App\Models\Room;
use App\Models\Teacher;
use App\Models\Domain;
use App\Models\CurriculumSnapshot;
use App\Models\DomainGroup;

class Subject extends Model
{
    protected $guarded = [];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }

    // Self-referencing relationship for Prerequisites
    public function prerequisite()
    {
        return $this->belongsTo(Subject::class, 'prerequisite_subject_id');
    }

    // Constraint Relationships
    public function prefTeacher()
    {
        return $this->belongsTo(Teacher::class, 'pref_teacher_id');
    }
    public function prefRoom()
    {
        return $this->belongsTo(Room::class, 'pref_room_id');
    }
    public function reqTeacher()
    {
        return $this->belongsTo(Teacher::class, 'req_teacher_id');
    }
    public function reqRoom()
    {
        return $this->belongsTo(Room::class, 'req_room_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
