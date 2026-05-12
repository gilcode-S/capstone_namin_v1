<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            /*
            |--------------------------------------------------------------------------
            | VERSIONING
            |--------------------------------------------------------------------------
            */

            $table->foreignId('schedule_version_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | CORE RELATIONS
            |--------------------------------------------------------------------------
            */

            $table->foreignId('subject_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('teacher_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('room_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('timeslot_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('section_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | SCHEDULING FLAGS
            |--------------------------------------------------------------------------
            */

            // TRUE if system used emergency/fallback scheduling
            $table->boolean('is_fallback')->default(false);
            $table->string('set')->default('A'); // Tracks if this is Set A or Set B
            $table->string('day');                // Stores 'Monday', 'Tuesday', etc.

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
