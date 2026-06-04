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
        Schema::table('conflicts', function (Blueprint $table) {
            //
            $table->unsignedBigInteger('schedule_id_a')
                ->nullable()
                ->change();

            $table->unsignedBigInteger('schedule_id_b')
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conflicts', function (Blueprint $table) {
            //

            $table->unsignedBigInteger('schedule_id_a')
                ->nullable(false)
                ->change();

            $table->unsignedBigInteger('schedule_id_b')
                ->nullable(false)
                ->change();
        });
    }
};
