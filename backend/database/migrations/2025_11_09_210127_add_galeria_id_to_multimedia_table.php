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
        Schema::table('multimedia', function (Blueprint $table) {
            $table->foreignId('galeria_id')->nullable()->after('peso')->constrained('galerias')->cascadeOnDelete(); // implementar el borrado de imagenes de la galeria tambien
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('multimedia', function (Blueprint $table) {
            $table->dropConstrainedForeignId('galeria_id');
        });
    }
};
