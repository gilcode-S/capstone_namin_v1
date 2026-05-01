<?php

namespace App\Models;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherSubjectRanking extends Model
{
    use HasFactory;

    /**
     * TABLE NAME
     * Explicitly defines the table used by this model.
     */
    protected $table = 'teacher_subject_rankings';

    /**
     * MASS ASSIGNABLE FIELDS
     * These fields are allowed for insert/update operations.
     */
    protected $fillable = [

        // SUBJECT ID (the subject being evaluated)
        'subject_id',

        // TEACHER ID (the teacher being ranked)
        'teacher_id',

        // FINAL COMPETENCY SCORE USED BY CP-SAT (0.0 - 1.0)
        'score',
    ];

    /**
     * SUBJECT RELATIONSHIP
     * Each ranking belongs to one subject.
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * TEACHER RELATIONSHIP
     * Each ranking belongs to one teacher.
     */
    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }
}


