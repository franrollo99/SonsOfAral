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
        Schema::create('galerias', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['concierto', 'banda']);
            $table->string('titulo')->nullable();
            $table->foreignId('concierto_id')->nullable()->constrained('conciertos')->nullOnDelete();
            $table->foreignId('portada_id')->nullable()->constrained('multimedia')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galerias');
    }
};
