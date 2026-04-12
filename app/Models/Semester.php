<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Section;
class Semester extends Model
{
    //
    protected $fillable = [
        'school_year',
        'term',
        'start_date',
        'end_date',
        'status'
    ];

    public function sections() 
    {
        return $this->hasMany(Section::class);
    }
}
