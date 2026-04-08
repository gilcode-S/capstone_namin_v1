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
        Schema::table('rooms', function (Blueprint $table) {
            // NEW FIELDS for Resource UI
            $table->string('resource_type')->nullable(); // classroom, lab, etc
            $table->string('building')->nullable();
            $table->string('floor')->nullable();
            $table->json('equipment')->nullable();

            // optional improved status (keep old values safe)
            $table->string('resource_status')->default('available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn([
                'resource_type',
                'building',
                'floor',
                'equipment',
                'resource_status'
            ]);
        });
    }
};
