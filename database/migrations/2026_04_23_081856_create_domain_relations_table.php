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
        Schema::create('domain_relations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('domain_a')
                ->constrained('domains')
                ->cascadeOnDelete();

            $table->foreignId('domain_b')
                ->constrained('domains')
                ->cascadeOnDelete();

            $table->float('score'); // 0–1

            $table->timestamps();

            // 🔥 prevent duplicates
            $table->unique(['domain_a', 'domain_b']);

            // ⚡ performance
            $table->index(['domain_a', 'domain_b']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domain_relations');
    }
};
