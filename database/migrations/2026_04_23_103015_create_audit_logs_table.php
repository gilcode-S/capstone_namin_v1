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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // 👤 who did the action
            $table->string('user');
            $table->string('role');

            // 🧾 what happened
            $table->string('action');   // e.g. "create", "update", "delete"
            $table->string('module');   // e.g. "subjects", "curriculum"

            $table->text('description');

            // 🔗 optional schedule version reference
            $table->foreignId('version_id')
                ->nullable()
                ->constrained('schedule_versions')
                ->nullOnDelete();

            // 🧠 before/after data tracking
            $table->json('changes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
