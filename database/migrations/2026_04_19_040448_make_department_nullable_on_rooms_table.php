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
        Schema::table('rooms', function (Blueprint $table) {
            // drop foreign key first
            $table->dropForeign(['department_id']);

            // make column nullable
            $table->foreignId('department_id')->nullable()->change();

            // re-add foreign key (optional but recommended)
            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->nullOnDelete(); // better than cascade now
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropForeign(['department_id']);

            $table->foreignId('department_id')->nullable(false)->change();

            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->cascadeOnDelete();
        });
    }
};
