<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    //

    protected $guarded = [];

    // This tells Laravel to automatically convert JSON strings to PHP Arrays
    protected $casts = [
        'availability_days' => 'array',
        'shift_preferences' => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function domainGroup()
    {
        return $this->belongsTo(DomainGroup::class);
    }
    public function specialization()
    {
        return $this->belongsTo(Domain::class, 'specialization_id');
    }
}
