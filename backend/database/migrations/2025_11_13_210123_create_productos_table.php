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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();
            $table->enum('tipo_producto', ['ropa', 'disco', 'accesorio']);
            $table->boolean('tiene_talla')->default(false);
            $table->json('tallas_disponibles')->nullable();
            $table->decimal('precio', 10, 2);
            $table->string('slug', 180)->unique();
            $table->foreignId('imagen_id')->nullable()->constrained('multimedia')->nullOnDelete();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
