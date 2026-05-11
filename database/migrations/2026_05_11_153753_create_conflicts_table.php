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
            // First schedule involved in conflict
            $table->foreignId('schedule_id_a')
                ->constrained('schedules')
                ->onDelete('cascade');

            // Second schedule involved in conflict
            $table->foreignId('schedule_id_b')
                ->constrained('schedules')
                ->onDelete('cascade');

            // Type of detected conflict
            $table->string('conflict_type');

            // Conflict status
            $table->enum('status', ['Unresolved', 'Resolved'])
                ->default('Unresolved');

            // How it was resolved
            $table->enum('resolution_method', ['Manual', 'Auto'])
                ->nullable();

            // When it was resolved
            $table->timestamp('resolved_at')
                ->nullable();

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
