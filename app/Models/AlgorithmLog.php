<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlgorithmLog extends Model
{
    //
    protected $fillable = [
        'algorithm_name',
        'execution_time',
        'hard_constraint_score',
        'soft_constraint_score',
        'resource_efficiency'
    ];
}
