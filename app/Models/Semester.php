<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    //
    protected $fillable = [
        'school_year',
        'term',
        'start_date',
        'end_date',
        'status'
    ];
}
