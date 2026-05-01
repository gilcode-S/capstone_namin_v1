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
        Schema::table('faculties', function (Blueprint $table) {
            //

            $table->foreignId('domain_group_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('domain_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            //
            $table->dropForeign(['domain_group_id']);
            $table->dropColumn('domain_group_id');

            $table->dropForeign(['domain_id']);
            $table->dropColumn('domain_id');
        });
    }
};
