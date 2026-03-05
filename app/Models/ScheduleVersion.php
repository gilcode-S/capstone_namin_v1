<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Semester;
use App\Models\User;
class ScheduleVersion extends Model
{
    //
    protected $fillable = [
        'semester_id',
        'version_number',
        'created_by',
        'is_active'
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
