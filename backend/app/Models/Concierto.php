<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Concierto extends Model
{
    protected $table = 'conciertos';

    protected $fillable = [
        'fecha',
        'provincia',
        'municipio',
        'lugar',
        'descripcion',
        'precio_entrada',
        'entrada_anticipada',
        'enlace_entrada_anticipada',
    ];

    public function imagen()
    {
        return $this->hasOne(Imagen::class);
    }
}
