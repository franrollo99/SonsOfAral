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
            $table->timestamps();
        });

        Schema::create('imageables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('imagen_id')->constrained('imagenes')->cascadeOnDelete();
            $table->unsignedBigInteger('imageable_id');
            $table->string('imageable_type', 191);
            $table->boolean('is_principal')->default(false);
            $table->timestamps();
            $table->index(['imageable_type','imageable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imageables');
        Schema::dropIfExists('imagenes');
    }
};