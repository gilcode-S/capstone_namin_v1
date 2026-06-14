<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryModeRule extends Model
{
    protected $fillable = [
        'program_id',
        'year_level',
        'delivery_mode'
    ];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }
}