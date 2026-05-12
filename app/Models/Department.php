<?php

namespace App\Models;

use App\Models\Programs;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    // protected $table = 'departments';
    protected $guarded = [];

    public function domainGroup()
    {
        return $this->belongsTo(DomainGroup::class);
    }
    public function programs()
    {
        return $this->hasMany(Programs::class);
    }
    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }
    public function schedules()
    {
        // This allows us to see how many schedules belong to this department 
        // by looking through the teachers assigned to it.
        return $this->hasManyThrough(Schedule::class, Teacher::class);
    }
}
