<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conflict extends Model
{
    //
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'schedule_id_a',
        'schedule_id_b',
        'conflict_type',
        'status',
        'resolution_method',
        'resolved_at',
        'notes'
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    /**
     * Relationship to the first involved schedule
     */
    public function scheduleA()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id_a');
    }

    /**
     * Relationship to the second involved schedule
     */
    public function scheduleB()
    {
        return $this->belongsTo(Schedule::class, 'schedule_id_b');
    }
}
