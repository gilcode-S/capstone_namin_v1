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

            // =========================
            // CORE RELATIONS
            // =========================
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('time_slot_id')->constrained()->cascadeOnDelete(); // ✅ MATCHED

            // =========================
            // MODE SYSTEM
            // =========================
            $table->enum('set_type', ['A', 'B']); // ✅ safer

            // =========================
            // ONLINE / FACE TO FACE
            // =========================
            $table->boolean('is_online')->default(false);
            $table->boolean('is_converted_online')->default(false);

            // =========================
            // METADATA
            // =========================
            $table->string('base_mode')->default('F2F');
            $table->string('generated_from')->nullable();

            // =========================
            // ACADEMIC
            // =========================
            $table->unsignedTinyInteger('year_level');

            // =========================
            // VERSIONING
            // =========================
            $table->foreignId('version_id')->constrained()->cascadeOnDelete(); // ✅ MATCHED

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
