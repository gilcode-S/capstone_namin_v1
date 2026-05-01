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
        Schema::create('room_time_locks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('time_slot_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('day', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

            $table->boolean('is_pe_room')->default(false);

            $table->boolean('is_available')->default(true);

            $table->enum('shift', ['Morning', 'Afternoon', 'Evening']);

            $table->boolean('is_online_slot')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_time_locks');
    }
};
