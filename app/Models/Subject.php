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
        'subject_type',
        'units',
        'lecture_hours',
        'lab_hours',
        'hours_per_week',
        'room_type',
        'year_level',
        'semester',
    ];
    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
}
