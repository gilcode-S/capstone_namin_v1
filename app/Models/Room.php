<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
class Room extends Model
{
    //
    protected $fillable = [
        'department_id',
        'room_type',
        'room_name',
        'capacity',
        'status'
    ];


    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
