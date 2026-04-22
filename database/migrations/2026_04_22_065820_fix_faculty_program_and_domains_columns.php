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
            // DROP old columns
            $table->dropColumn(['programs', 'domains']);

            // ADD clean columns
            $table->string('program')->nullable()->after('department_id');
            $table->string('domain')->nullable()->after('program');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn(['program', 'domain']);

            // restore old structure if needed
            $table->json('program')->nullable();
            $table->json('domains')->nullable();
        });
    }
};
