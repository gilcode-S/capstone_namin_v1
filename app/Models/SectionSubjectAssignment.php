<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ScheduleVersion;
use App\Models\Subject;
use App\Models\Section;
use App\Models\Faculty;
class SectionSubjectAssignment extends Model
{
    //

    protected $fillable = [
        'schedule_version_id',
        'section_id',
        'subject_id',
        'faculty_id'
    ];


    public function version()
    {
        return $this->belongsTo(ScheduleVersion::class, 'schedule_version_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}
