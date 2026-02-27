<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Programs;
class Subject extends Model
{
    //
    protected $fillable = [
        'program_id',
        'subject_code',
        'subject_name',
        'units',
        'lecture_hours',
        'lab_hours',
        'year_level',
        'semester'
    ];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
}
