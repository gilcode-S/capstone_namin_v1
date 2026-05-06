<?php

namespace App\Models;
use App\Models\Programs;
use App\Models\Subject;

use Illuminate\Database\Eloquent\Model;

class CurriculumSubject extends Model
{
    //
    protected $guarded = [];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
