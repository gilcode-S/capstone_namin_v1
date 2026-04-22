<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\FacultyAvailability;
use App\Models\Subject;
use App\Models\SectionSubjectAssignment;
use App\Models\Schedule;
use App\Models\Shift;

class Faculty extends Model
{
    //
    protected $fillable = [
        'department_id',
        'faculty_code',
        'first_name',
        'last_name',
        'email',
        'employment_type',
        'max_load_units',
        'status',
        'qualification_level',
        'years_experience',
        'current_load',
        'degree',
        'domain',
        'program'
    ];

    protected $casts = [
        'preferred_timeslots' => 'array',
  
    ];
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function shifts()
    {
        return $this->belongsToMany(Shift::class);
    }
    public function availabilities()
    {
        return $this->hasMany(FacultyAvailability::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class)
            ->withPivot('priority_level')
            ->withTimestamps();
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function assignments()
    {
        return $this->hasMany(SectionSubjectAssignment::class);
    }

    // public function schedules()
    // {
    //     return $this->hasManyThrough(
    //         Schedule::class,
    //         SectionSubjectAssignment::class,
    //         'faculty_id',
    //         'assignment_id',
    //         'id',
    //         'id'
    //     );
    // }
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
