<?php

namespace App\Models;

use App\Models\Programs;
use App\Models\Department;
use App\Models\CurriculumSnapshot;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    //


    protected $guarded = [];

    public function program()
    {
        return $this->belongsTo(Programs::class);
    }

    // Intercept the save process to generate the Section Code (e.g., BC2MA-O)
    protected static function booted()
    {
        static::saving(function ($section) {
            // Ensure the program is loaded to get the code
            $programCode = $section->program->code ?? Programs::find($section->program_id)->code;

            // Math: Year 1=1, Year 2=3, Year 3=5, Year 4=7
            $yearBase = ($section->year_level * 2) - 1;

            // Add +1 if it is the second semester
            $timeCode = $section->semester == 2 ? $yearBase + 1 : $yearBase;

            // Shift mapping
            $shiftCode = match ($section->shift) {
                'Morning' => 'M',
                'Afternoon' => 'D',
                'Evening' => 'E',
                default => 'X'
            };

            // Combine: BC + 2 + M + A
            $generatedName = $programCode . $timeCode . $shiftCode . strtoupper($section->letter);

            // Append Octoberian if checked
            if ($section->is_octoberian) {
                $generatedName .= '-O';
            }

            $section->name = $generatedName;
        });
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
