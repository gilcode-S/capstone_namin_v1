<?php

namespace App\Models;

use App\Models\Department;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    protected $fillable = ['name'];

    public function departments()
    {
        return $this->hasMany(Department::class);
    }
}
