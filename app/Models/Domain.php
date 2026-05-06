<?php

namespace App\Models;

use App\Models\Department;
use App\Models\DomainGroup;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    protected $guarded = [];

    public function group()
    {
        return $this->belongsTo(DomainGroup::class, 'domain_group_id');
    }
}
