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

            // 1. Drop old domains column
            $table->dropColumn('domains');

            // 2. Add domain_id
            $table->foreignId('domain_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // 3. Change preferred_shift to enum
            $table->enum('preferred_shift', ['Morning', 'Afternoon', 'Evening'])
                ->nullable()
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {

            $table->dropConstrainedForeignId('domain_id');

            $table->longText('domains')->nullable();

            $table->string('preferred_shift')->nullable()->change();
        });
    }
};
