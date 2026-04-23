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
        Schema::create('conflicts', function (Blueprint $table) {
            $table->id();

            // 🔗 linked to schedule version
            $table->foreignId('version_id')
                ->constrained('schedule_versions')
                ->cascadeOnDelete();

            // 📌 conflict info
            $table->string('type'); // e.g. "time_overlap", "room_conflict"
            $table->text('description');

            // 🟢 status
            $table->boolean('resolved')->default(false);

            $table->enum('resolution_type', ['auto', 'manual', 'unresolved'])
                ->default('unresolved');

            // 🧠 flexible data storage (teacher, room, subject, etc.)
            $table->json('meta')->nullable();

            // 💡 AI or system suggestion
            $table->text('suggestion')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conflicts');
    }
};
