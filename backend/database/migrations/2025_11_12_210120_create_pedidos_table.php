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
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_pedido', 8)->unique();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('estado', ['pendiente', 'enviado', 'entregado', 'cancelado'])->default('pendiente');
            $table->decimal('precio_total', 8, 2);

            $table->string('nombre_envio', 150);
            $table->string('telefono', 30)->nullable();

            $table->string('direccion', 200);
            $table->string('municipio', 120);
            $table->string('provincia', 120);
            $table->string('cp', 10);

            $table->string('metodo_pago', 30)->default('tarjeta');
            $table->decimal('gastos_envio', 10, 2)->default(0);

            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
