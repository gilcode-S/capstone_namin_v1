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
        Schema::create('domain_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('domain_group_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        // 2. DEPARTMENTS & PROGRAMS (Page 1)
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('domain_group_id')->constrained();
            $table->timestamps();
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // e.g., BSIT, BSCS
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        // 3. ROOMS (Page 6)
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('generated_name')->unique(); // e.g., C201 Computer Lab
            $table->string('description_name')->nullable();
            $table->enum('type', ['Classroom', 'Lab', 'PE', 'Online']);
            $table->integer('capacity');
            $table->string('building');
            $table->integer('floor');
            $table->string('room_number');
            $table->text('equipment')->nullable();
            $table->timestamps();
        });

        Schema::create('specializations', function (Blueprint $table) {
            $table->id();

            $table->string('name'); // e.g. "Software Engineering", "Mathematics"
            $table->timestamps();
        });

        // 4. TEACHERS / FACULTY (Page 5)
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('department_id')->constrained();
            $table->enum('degree', ['Undergraduate', 'Masters', 'PhD']);
            $table->foreignId('domain_group_id')->constrained();
            $table->foreignId('specialization_id')->nullable()->constrained('domains');
            $table->string('custom_specialization')->nullable();
            $table->integer('experience_years');
            $table->integer('min_hours');
            $table->integer('max_hours');
            $table->json('availability_days'); // e.g., ["Monday", "Tuesday"]
            $table->json('shift_preferences'); // e.g., ["Morning", "Afternoon"]
            $table->timestamps();
        });

        // 5. SUBJECTS (Page 2)
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['Major', 'Minor']);
            $table->integer('units');

            // Major Subject Logic
            $table->foreignId('program_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('prerequisite_subject_id')->nullable()->constrained('subjects')->nullOnDelete();

            // Minor Subject Logic
            $table->foreignId('domain_id')->nullable()->constrained();

            // Advance Options: Soft Constraints (Preferred)
            $table->string('pref_day')->nullable();
            $table->enum('pref_shift', ['Morning', 'Afternoon', 'Evening'])->nullable();
            $table->foreignId('pref_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('pref_room_id')->nullable()->constrained('rooms')->nullOnDelete();

            // Advance Options: Hard Constraints (Required)
            $table->string('req_day')->nullable();
            $table->enum('req_shift', ['Morning', 'Afternoon', 'Evening'])->nullable();
            $table->foreignId('req_teacher_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->foreignId('req_room_id')->nullable()->constrained('rooms')->nullOnDelete();

            $table->timestamps();
        });

        // 6. CURRICULUM GUIDE (Page 3)
        Schema::create('curriculum_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->integer('year_level'); // 1, 2, 3, 4
            $table->integer('semester'); // 1, 2
            $table->timestamps();
        });

        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Auto-generated: BC2MA
            $table->foreignId('program_id')->constrained();
            $table->integer('year_level');
            $table->integer('semester');
            $table->enum('shift', ['Morning', 'Afternoon', 'Evening']);
            $table->string('letter', 1); // A-Z
            $table->boolean('is_octoberian')->default(false);
            $table->integer('capacity');
            $table->timestamps();
        });

        // 8. TIMESLOTS (Page 7)
        Schema::create('timeslots', function (Blueprint $table) {
            $table->id();
            $table->string('day'); // Monday - Sunday
            $table->enum('shift', ['Morning', 'Afternoon', 'Evening']);
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeslots');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('curriculum_subjects');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('domains');
        Schema::dropIfExists('domain_groups');
    }
};
