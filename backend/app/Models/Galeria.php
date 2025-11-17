<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeria extends Model
{
    protected $table = 'galerias';

    protected $fillable = [
        'titulo',
        'descripcion',
        'slug',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function imagenes()
    {
        return $this->hasMany(Imagen::class);
    }
}
