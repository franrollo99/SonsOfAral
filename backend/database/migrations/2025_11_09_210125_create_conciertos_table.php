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
        Schema::create('conciertos', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->string('provincia', 150);
            $table->string('municipio', 150);
            $table->string('lugar', 150);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_entrada', 10, 2)->nullable();
            $table->boolean('entrada_anticipada')->default(false);
            $table->string('enlace_entrada_anticipada')->nullable();
            $table->string('imagen', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conciertos');
    }
};
