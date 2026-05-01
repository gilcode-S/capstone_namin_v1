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
        Schema::create('scheduling_units', function (Blueprint $table) {
            $table->id();
            // WHICH SECTION
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();

            // SUBJECT
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();

            // OPTIONAL PREFERRED TEACHER
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();

            // 1 HOUR OR 2 HOURS BLOCK
            $table->integer('duration_hours');

            // GROUP SAME SUBJECT SPLIT
            $table->integer('meeting_group');

            // PREFERENCES
            $table->string('preferred_day')->nullable();
            $table->string('preferred_shift')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduling_units');
    }
};
