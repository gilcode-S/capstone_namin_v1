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

            if (!Schema::hasColumn('subjects', 'preferred_teacher_id')) {
                $table->foreignId('preferred_teacher_id')
                    ->nullable()
                    ->constrained('faculties')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('subjects', 'preferred_room_id')) {
                $table->foreignId('preferred_room_id')
                    ->nullable()
                    ->constrained('rooms')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('subjects', 'prerequisite_id')) {
                $table->foreignId('prerequisite_id')
                    ->nullable()
                    ->constrained('subjects')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('subjects', 'preferred_days')) {
                $table->json('preferred_days')->nullable();
            }

            if (!Schema::hasColumn('subjects', 'domains')) {
                $table->json('domains')->nullable();
            }

            if (!Schema::hasColumn('subjects', 'preferred_shift')) {
                $table->string('preferred_shift')->nullable();
            }

            if (!Schema::hasColumn('subjects', 'is_hard_constraint')) {
                $table->boolean('is_hard_constraint')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('subjects', function (Blueprint $table) {

            // drop only if exists (safe approach)
            if (Schema::hasColumn('subjects', 'preferred_teacher_id')) {
                $table->dropForeign(['preferred_teacher_id']);
            }

            if (Schema::hasColumn('subjects', 'preferred_room_id')) {
                $table->dropForeign(['preferred_room_id']);
            }

            if (Schema::hasColumn('subjects', 'prerequisite_id')) {
                $table->dropForeign(['prerequisite_id']);
            }

            $table->dropColumn([
                'preferred_teacher_id',
                'preferred_room_id',
                'prerequisite_id',
                'preferred_days',
                'domains',
                'is_hard_constraint',
                'preferred_shift',
            ]);
        });
    }
};
