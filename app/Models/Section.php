<?php

namespace App\Models;
use App\Models\Programs;
use App\Models\Department;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    //
    protected $fillable = [
        'program_id', 
        'section_name',
        'year_level',
        'student_count'
    ];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
