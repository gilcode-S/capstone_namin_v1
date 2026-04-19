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
            $table->string('domain_a');
            $table->string('domain_b');
            $table->float('score');
            $table->timestamps();

            // Optional (recommended for performance)
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
