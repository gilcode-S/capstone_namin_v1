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
        Schema::table('subjects', function (Blueprint $table) {
            // ✅ make program optional (for minor subjects)
            $table->foreignId('program_id')->nullable()->change();

            // ✅ NEW FIELDS ONLY
            $table->string('domain')->nullable();

            $table->string('preferred_teacher')->nullable();
            $table->string('preferred_day')->nullable();
            $table->string('preferred_shift')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('subjects', function (Blueprint $table) {

            $table->dropColumn([
   
                'domain',
              
                'preferred_teacher',
                'preferred_day',
                'preferred_shift'
            ]);
        });
    }
};
