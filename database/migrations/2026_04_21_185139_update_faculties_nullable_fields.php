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
        //
        Schema::table('faculties', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->enum('employment_type', ['full_time', 'part_time'])->nullable()->change();

            $table->integer('max_load_units')->nullable()->change();
            $table->enum('status', ['active', 'inactive'])->nullable()->change();

            $table->string('degree')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
