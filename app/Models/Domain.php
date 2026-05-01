<?php

namespace App\Models;

use App\Models\Department;
use App\Models\DomainGroup;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    protected $fillable = ['name'];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function domainGroup()
{
    return $this->belongsTo(DomainGroup::class);
}
}
