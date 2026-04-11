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
        Schema::table('subjects', function (Blueprint $table) {
            //
            $table->enum('subject_type', ['major', 'minor'])->after('subject_name');
            $table->integer('hours_per_week')->after('subject_type');
            $table->string('room_type')->nullable()->after('hours_per_week');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            //
            $table->dropColumn([
                'subject_type',
                'hours_per_week',
                'room_type'
            ]);
        });
    }
};
