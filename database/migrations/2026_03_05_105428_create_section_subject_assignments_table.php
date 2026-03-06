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
        Schema::create('section_subject_assignments', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('schedule_version_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();    
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();    
            $table->foreignId('faculty_id')->nullable()->constrained()->nullOnDelete();    
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('section_subject_assignments');
    }
};
