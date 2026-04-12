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
        Schema::table('sections', function (Blueprint $table) {
            //
            // connect semester
            $table->foreignId('semester_id')
                ->after('program_id')
                ->constrained('semesters')
                ->cascadeOnDelete();

            // new fields from your UI
            $table->string('shift')->after('year_level');

            $table->boolean('octoberian')->default(false)->after('student_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            //
            $table->dropForeign(['semester_id']);
            $table->dropColumn(['semester_id', 'shift', 'octoberian']);
        });
    }
};
