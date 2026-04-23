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
        Schema::create('class_units', function (Blueprint $table) {
            $table->id();

            // 🔗 links
            $table->foreignId('section_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('subject_id')
                ->constrained()
                ->cascadeOnDelete();

            // 📚 academic context
            $table->integer('year_level');
            $table->integer('semester');

            // 🧠 matching system (VERY IMPORTANT for CP-SAT + domain engine)
            $table->string('domain');

            // ⏱ teaching load
            $table->integer('units');

            // 🏫 room requirement
            $table->string('room_type');

            // ⚙️ flexible constraints (teacher, day, shift, etc.)
            $table->json('constraints')->nullable();

            // 📌 scheduling status
            $table->enum('status', ['pending', 'generated'])
                ->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_units');
    }
};
