<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;

class Room extends Model
{
    //
    protected $fillable = [
        'department_id',
        'room_name',
        'room_type', // keep (legacy)
        'resource_type', // NEW
        'capacity',
        'building',
        'floor',
        'equipment',
        'status', // old
        'resource_status' // NEW
    ];

    protected $casts = [
        'equipment' => 'array'
    ];
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
