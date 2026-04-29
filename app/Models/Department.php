<?php

namespace App\Models;

use App\Models\Programs;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    // protected $table = 'departments';
    protected $fillable = [
        'department_code',
        'department_name',
        'domain'
    ];
   

    public function programs()
    {
        return $this->hasMany(Programs::class);
    }
}
