<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherRanking extends Model
{
    //

    protected $fillable = [
        'faculty_id',
        'subject_id',
        'score',
        'rank_position',
        'subject_type',
    ];
}
