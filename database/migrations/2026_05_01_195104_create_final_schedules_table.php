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
        Schema::create('final_schedules', function (Blueprint $table) {
            $table->id(); // primary key

            $table->unsignedBigInteger('schedule_version_id'); // schedule version

            $table->unsignedBigInteger('section_id'); // section assigned
            $table->unsignedBigInteger('subject_id'); // subject assigned
            $table->unsignedBigInteger('faculty_id'); // teacher assigned

            $table->unsignedBigInteger('room_id')->nullable(); // NULL if ONLINE

            $table->unsignedBigInteger('time_slot_id'); // time slot reference

            $table->enum('set_type', ['A', 'B']); // Set A or Set B

            $table->boolean('is_online')->default(false); // online flag

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_schedules');
    }
};
