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
        Schema::create('schedule_versions', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "2026 - 2027 FIRST SEMESTER"
            $table->string('academic_year'); // e.g., "2026-2027"
            $table->string('semester'); // e.g., "First", "Second", "Summer"
            $table->integer('version_number')->default(1);
            $table->enum('status', ['Draft', 'Active', 'Archived'])->default('Draft');
            $table->date('effective_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_versions');
    }
};
