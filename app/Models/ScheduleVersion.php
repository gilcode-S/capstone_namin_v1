<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Semester;
use App\Models\User;

class ScheduleVersion extends Model
{
    //
    protected $guarded = [];



    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
