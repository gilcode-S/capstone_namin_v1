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
            $table->uuid('id')->primary();

            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('user_name');
            $table->string('role')->nullable();

            $table->string('action');     // CREATE, UPDATE, DELETE, RESTORE
            $table->string('module');     // Scheduler, Users, etc.

            $table->text('description')->nullable();

            $table->json('old_data')->nullable();
            $table->json('new_data')->nullable();

            $table->boolean('is_restorable')->default(true);

            $table->timestamp('created_at')->useCurrent();
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
