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
        Schema::table('schedules', function (Blueprint $table) {
            $table->boolean('is_online')->default(false)->after('status');

            $table->integer('year_level')->nullable()->after('is_online');

            $table->enum('base_mode', ['F2F', 'ONLINE'])
                ->default('F2F')
                ->after('year_level');

            $table->enum('generated_from', ['SET_A', 'SET_B'])
                ->nullable()
                ->after('base_mode');

            $table->boolean('is_converted_online')->default(false)
                ->after('generated_from');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn([
                'is_online',
                'year_level',
                'base_mode',
                'generated_from',
                'is_converted_online',
            ]);
        });
    }
};
