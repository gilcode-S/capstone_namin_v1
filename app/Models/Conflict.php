<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conflict extends Model
{
    //

    protected $fillable = [
        'version_id',
        'type',
        'description',
        'resolved',
        'meta'
    ];
}
