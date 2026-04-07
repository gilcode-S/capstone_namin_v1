<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Faculty;
class Shift extends Model
{
    //

    protected $fillable = [
        'name',
        'start_time',
        'end_time'
    ];

    public function faculties()
    {
        return $this->belongsToMany(Faculty::class);
    }
}
