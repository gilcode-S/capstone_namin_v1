<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Semester;
use App\Models\User;

class ScheduleVersion extends Model
{
    //
    protected $fillable = [
        'name',
        'version_number',
        'semester_id',
        'effective_date',
        'set_a_count',
        'set_b_count',
        'status',
        'created_by', // 🔥 MUST BE HERE
    ];


    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
