<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Programs;
use App\Models\Subject;

class Curriculum extends Model
{
    //
    protected $table = 'curriculums';
    protected $fillable = [
        'program_id',
        'subject_id',
        'year_level',
        'semester'
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
}
