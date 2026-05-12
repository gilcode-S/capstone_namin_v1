<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Department;
use App\Models\Schedule;

class Room extends Model
{
    //
    protected $guarded = [];

    protected $casts = [
        'equipment' => 'array',
    ];
    // Intercept the save process to generate the Room Name (e.g., C201 Computer Lab)
    protected static function booted()
    {
        static::saving(function ($room) {
            $baseName = $room->building . $room->floor . $room->room_number;

            if ($room->description_name) {
                $baseName .= ' ' . $room->description_name;
            }

            $room->generated_name = $baseName;
        });
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Calculates current utilization based on a standard 40-hour school week
     */
    public function getUtilizationPercentageAttribute()
    {
        $totalHours = $this->schedules()->count(); // Simplified for count-based logic
        return ($totalHours / 40) * 100;
    }
}
