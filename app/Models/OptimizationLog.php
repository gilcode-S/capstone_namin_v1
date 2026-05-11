<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OptimizationLog extends Model
{
    //
    protected $fillable = [
        'algorithm_name',
        'execution_time',
        'hard_constraints_score',
        'soft_constraints_score',
        'resource_efficiency'
    ];
}
