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
        Schema::create('optimization_logs', function (Blueprint $table) {
            $table->id();
            $table->string('algorithm_name'); // e.g., 'Genetic Algorithm', 'Tabu Search'
            $table->float('execution_time'); // in seconds
            $table->integer('hard_constraints_score'); // 0-100
            $table->integer('soft_constraints_score'); // 0-100
            $table->float('resource_efficiency'); // 0-100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('optimization_logs');
    }
};
