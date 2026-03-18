<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\FacultyAvailability;
use App\Models\Subject;
class Faculty extends Model
{
    //
    protected $fillable = [
        'department_id',
        'faculty_code',
        'first_name',
        'last_name',
        'email',
        'employement_type',
        'max_load_hours',
        'status'
    ];

    protected $casts = [
        'preferred_timeslots' => 'array'
    ];
    public function department()
    {
        return $this->belongsTo(Department::class);
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
}
