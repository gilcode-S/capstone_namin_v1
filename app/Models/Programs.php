<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Curriculum;

class Programs extends Model
{
    //
    protected $fillable = [
        'department_id',
        'program_code',
        'program_name'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
    public function curriculums()
    {
        return $this->hasMany(Curriculum::class);
    }
}
