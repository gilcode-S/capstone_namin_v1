<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
class Programs extends Model
{
    //
    protected $fillable = [
        'department_id',
        'program_code',
        'program_name'
    ];
    
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
