<?php

namespace App\Models;

use App\Models\Department;
use App\Models\Domain;
use Illuminate\Database\Eloquent\Model;

class DomainGroup extends Model
{
    // protected $fillable = ['name'];

    protected $guarded = [];

    public function domains()
    {
        return $this->hasMany(Domain::class);
    }
    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
