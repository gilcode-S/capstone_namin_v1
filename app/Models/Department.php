<?php

namespace App\Models;

use App\Models\Programs;
use App\Models\Domain;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    // protected $table = 'departments';
    protected $fillable = [
        'department_code',
        'department_name',
        'domain_group_id'
    ];


    public function programs()
    {
        return $this->hasMany(Programs::class);
    }

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }

    public function domainGroup()
    {
        return $this->belongsTo(DomainGroup::class, 'domain_group_id');
    }
}
