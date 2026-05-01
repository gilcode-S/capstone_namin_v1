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

            $table->foreignId('version_id')
                ->constrained('schedule_versions')
                ->onDelete('cascade');

            $table->string('set_type');
            // A or B

            $table->float('performance_score');
            // overall system quality

            $table->float('utilization_score');
            // resource usage efficiency

            $table->float('optimization_score');
            // CP-SAT score

            $table->float('online_ratio');
            // % of online schedules

            $table->float('ftf_ratio');
            // % of face-to-face schedules

            $table->json('breakdown')->nullable();
            // detailed metrics

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
