<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Programs;
use App\Models\Department;
use App\Models\Section;
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
        'domains',
        'preferred_teacher',
        'preferred_day',
        'preferred_shift',
        'room_type_required',
    ];
    protected $casts = [
        'domains' => 'array',
    ];
    public function preferredTeacher()
    {
        return $this->belongsTo(Faculty::class, 'preferred_teacher_id');
    }
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

    // public function getDomainAttribute()
    // {
    //     return $this->program?->department?->domain;
    // }
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
    public function sections()
    {
        return $this->belongsToMany(Section::class, 'section_subject_assignments');
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
