<?php

namespace App\Models;

use App\Models\Department;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;

class DomainGroup extends Model
{
    protected $fillable = ['name'];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'domain_group_id');
    }

    public function domains()
    {
        return $this->hasMany(Domain::class);
    }
}
