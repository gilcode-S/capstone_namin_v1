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
        Schema::table('schedule_versions', function (Blueprint $table) {
            //
            // NEW REQUIRED FIELDS (make nullable for old data safety)
            $table->string('name')->nullable()->after('id');
            $table->date('effective_date')->nullable()->after('version_number');

            $table->integer('set_a_count')->default(0)->after('effective_date');
            $table->integer('set_b_count')->default(0)->after('set_a_count');

            $table->enum('status', ['draft', 'active', 'archived'])
                ->default('draft')
                ->after('set_b_count');

            $table->dropColumn('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedule_versions', function (Blueprint $table) {
            //
            $table->dropColumn([
                'name',
                'effective_date',
                'set_a_count',
                'set_b_count',
                'status',
            ]);

            $table->boolean('is_active')->default(false);
        });
    }
};
