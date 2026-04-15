<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Programs;
use App\Models\Department;
use App\Models\Curriculum;

class Subject extends Model
{
    //
    protected $fillable = [
        'program_id',
        'subject_code',
        'subject_name',
        'subject_type',
        'units',
        'lecture_hours',
        'lab_hours',
        'hours_per_week',
        'room_type',
        'year_level',
        'semester',

        'preferred_teacher',
        'preferred_day',
        'preferred_shift',
        'domain'
    ];

    public function isMajor(): bool
    {
        return $this->subject_type === 'major';
    }

    public function isMinor(): bool
    {
        return $this->subject_type === 'minor';
    }

    public function setDomainAutomatically()
    {
        if ($this->isMajor() && $this->program) {
            $this->domain = $this->program->get_domain ?? null;
        }
    }

    public function getDomainAttribute()
    {
        return $this->program?->department?->domain;
    }
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
    public function curriculums()
    {
        return $this->hasMany(Curriculum::class);
    }

    // subjects that THIS subject requires
    public function prerequisites()
    {
        return $this->belongsToMany(
            Subject::class,
            'subject_prerequisites',
            'subject_id',
            'prerequisite_subject_id'
        );
    }

    // subjects that REQUIRE this subject
    public function dependents()
    {
        return $this->belongsToMany(
            Subject::class,
            'subject_prerequisites',
            'prerequisite_subject_id',
            'subject_id'
        );
    }

    public function getDisplayTypeAttribute()
    {
        return ucfirst($this->subject_type);
    }
}
