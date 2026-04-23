<?php

namespace App\Models;

use App\Models\Programs;
use App\Models\Department;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    //
    protected $fillable = [
        'program_id',
        'semester_id',
        'section_name',
        'year_level',
        'shift',
        'student_count',
        'octoberian',
    ];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'section_subject_assignments');
    }

    public function curriculums()
    {
        return $this->hasMany(Curriculum::class, 'program_id', 'program_id');
    }
}
