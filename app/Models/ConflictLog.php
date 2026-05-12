<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConflictLog extends Model
{
    //
    protected $fillable = [
        'month',
        'detected_count',
        'resolved_count'
    ];
}
