<?php

namespace App\Models;
use App\Models\Programs;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    //
    protected $fillable = [
        'program_id', 
        'section_name',
        'year_level',
        'student_count'
    ];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
}
