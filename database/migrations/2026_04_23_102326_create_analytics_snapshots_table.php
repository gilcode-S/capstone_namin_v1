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
        Schema::create('analytics_snapshots', function (Blueprint $table) {
            $table->id();

            // 🔗 linked schedule version
            $table->foreignId('version_id')
                ->constrained('schedule_versions')
                ->cascadeOnDelete();

            // 📊 core performance metrics (0–1 or percentage scale)
            $table->float('efficiency');
            $table->float('teacher_utilization');
            $table->float('room_utilization');

            // 🧠 optimization quality scores
            $table->float('constraint_satisfaction')->default(0);
            $table->float('load_balance_score')->default(0);
            $table->float('optimization_score')->default(0);

            // 📦 optional pattern storage (AI/CP-SAT insights)
            $table->json('pattern')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_snapshots');
    }
};
