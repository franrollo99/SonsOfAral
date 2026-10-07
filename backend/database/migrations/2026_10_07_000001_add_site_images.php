<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('multimedia', function (Blueprint $table) {
            $table->json('variants')->nullable();
        });
        Schema::create('site_images', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->foreignId('multimedia_id')->nullable()->constrained('multimedia')->nullOnDelete();
            $table->string('alt', 255)->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_images');
        Schema::table('multimedia', function (Blueprint $table) {
            $table->dropColumn('variants');
        });
    }
};
