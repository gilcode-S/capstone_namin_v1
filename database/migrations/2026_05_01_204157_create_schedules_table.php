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
            $table->foreignId('version_id')->constrained()->cascadeOnDelete();

            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();

            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();

            $table->foreignId('section_id')->constrained()->cascadeOnDelete();

            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();

            $table->string('day');
            $table->string('timeslot');

            $table->enum('set_type', ['A', 'B']);

            $table->boolean('is_online')->default(false);

            $table->integer('meeting_group');

            // analytics
            $table->float('domain_score')->nullable();
            $table->float('teacher_score')->nullable();
            $table->float('cp_sat_weight')->nullable();
            $table->string('conflict_type')->nullable();

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
