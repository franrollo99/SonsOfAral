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
        Schema::create('imagenes', function (Blueprint $table) {
            $table->id();
            $table->string('ruta', 2048);
            $table->string('alt', 255)->nullable();
            $table->string('mime', 100)->nullable();
            $table->foreignId('producto_id')->nullable()->constrained('productos')->cascadeOnDelete();
            $table->foreignId('concierto_id')->unique()->nullable()->constrained('conciertos')->cascadeOnDelete();
            $table->foreignId('lanzamiento_id')->unique()->nullable()->constrained('lanzamientos')->cascadeOnDelete();
            $table->foreignId('galeria_id')->nullable()->constrained('galerias')->cascadeOnDelete();
            $table->boolean('es_principal')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imagenes');
    }
};
