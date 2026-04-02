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
        Schema::create('lanzamientos', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['album', 'single']);
            $table->string('titulo', 200);
            $table->date('fecha_lanzamiento')->nullable();
            $table->text('descripcion')->nullable();
            $table->foreignId('portada_id')->nullable()->constrained('multimedia')->nullOnDelete();
            $table->string('compra_url', 255)->nullable();
            $table->string('audio_url', 255)->nullable();
            $table->string('video_url', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lanzamientos');
    }
};
