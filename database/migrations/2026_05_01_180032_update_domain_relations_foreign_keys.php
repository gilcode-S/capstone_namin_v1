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
        Schema::table('domain_relations', function (Blueprint $table) {
            // Drop old foreign keys first
            $table->dropForeign(['domain_a']);
            $table->dropForeign(['domain_b']);

            // Recreate with domain_groups
            $table->foreign('domain_a')
                ->references('id')
                ->on('domain_groups')
                ->cascadeOnDelete();

            $table->foreign('domain_b')
                ->references('id')
                ->on('domain_groups')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domain_relations', function (Blueprint $table) {
            $table->dropForeign(['domain_a']);
            $table->dropForeign(['domain_b']);

            $table->foreign('domain_a')
                ->references('id')
                ->on('domains')
                ->cascadeOnDelete();

            $table->foreign('domain_b')
                ->references('id')
                ->on('domains')
                ->cascadeOnDelete();
        });
    }
};
