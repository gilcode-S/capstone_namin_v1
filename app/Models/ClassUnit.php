<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassUnit extends Model
{
    //
    protected $fillable = [
        'section_id',
        'subject_id',
        'year_level',
        'semester',
        'domain',
        'units',
        'room_type',
        'constraints',
        'status',
    ];

    protected $casts = [
        'constraints' => 'array',
    ];

    // relationships (optional but useful later)
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
