<?php

namespace App\Models;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchedulingUnit extends Model
{
    use HasFactory;

    /**
     * TABLE NAME
     * Explicitly defines the database table used by this model.
     */
    protected $table = 'scheduling_units';

    /**
     * MASS ASSIGNABLE FIELDS
     * These are the fields allowed for bulk insert/update.
     */
    protected $fillable = [

        // SECTION IDENTIFIER
        'section_id',

        // SUBJECT IDENTIFIER
        'subject_id',

        // PREFERRED OR ASSIGNED TEACHER
        'faculty_id',

        // DURATION (1H OR 2H SPLIT LOGIC)
        'duration_hours',

        // GROUPING FOR SPLIT SUBJECTS (2H + 1H belongs together)
        'meeting_group',

        // PREFERRED SCHEDULING DAY
        'preferred_day',

        // PREFERRED SHIFT (morning, afternoon, evening)
        'preferred_shift',
    ];

    /**
     * SECTION RELATIONSHIP
     * A scheduling unit belongs to one section.
     */
    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * SUBJECT RELATIONSHIP
     * A scheduling unit belongs to one subject.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * TEACHER RELATIONSHIP (OPTIONAL)
     * A scheduling unit may have a preferred or assigned teacher.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}
