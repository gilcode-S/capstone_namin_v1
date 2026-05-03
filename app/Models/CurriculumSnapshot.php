<?php

namespace App\Models;
use App\Models\Subject;
use App\Models\Programs;
use App\Models\Section;
use App\Models\Faculty;
use Illuminate\Database\Eloquent\Model;

class CurriculumSnapshot extends Model
{
    //
    protected $fillable = [
        'section_id',
        'subject_id',
        'hours_per_week',
        'preferred_teacher_id',
        'preferred_day',
        'preferred_shift',
        'semester_id',
        'version_id',
    ];


    // 🟦 SECTION
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    // 🟩 SUBJECT
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    // 🟨 PROGRAM
    public function program()
    {
        return $this->belongsTo(Programs::class);
    }

    // 🟪 TEACHER (optional but useful)
    public function faculty()
    {
        return $this->belongsTo(Faculty::class, 'preferred_teacher_id');
    }
}
