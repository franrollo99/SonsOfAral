<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lanzamiento extends Model
{
    protected $table = 'lanzamientos';

    protected $fillable = [
        'titulo',
        'tipo',
        'fecha_lanzamiento',
        'descripcion',
    ];

    public function canciones()
    {
        return $this->hasMany(Cancion::class);
    }

    public function imagen()
    {
        return $this->hasOne(Imagen::class);
    }
}
