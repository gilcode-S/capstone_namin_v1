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

            // 1. Drop old foreign key first (important)
            $table->dropForeign(['domain_id']);

            // 2. Rename column
            $table->renameColumn('domain_id', 'domain_group_id');
        });

        Schema::table('subjects', function (Blueprint $table) {

            // 3. Re-add correct foreign key
            $table->foreign('domain_group_id')
                ->references('id')
                ->on('domain_groups')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            //

            $table->dropForeign(['domain_group_id']);

            $table->renameColumn('domain_group_id', 'domain_id');
        });

        Schema::table('subjects', function (Blueprint $table) {

            $table->foreign('domain_id')
                ->references('id')
                ->on('domains')
                ->nullOnDelete();
        });
    }
};
