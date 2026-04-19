<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class TimeSlot extends Model
{
    //

    protected $fillable = [
        'day_of_week',
        'start_time',
        'end_time',
        'shift',
        'status'
    ];
    
    public function getStartTimeAttribute($value)
    {
        return Carbon::parse($value)->format('g:i A');
    }

    public function getEndTimeAttribute($value)
    {
        return Carbon::parse($value)->format('g:i A');
    }
}
