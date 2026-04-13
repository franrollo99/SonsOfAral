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
        'cartel_id',
    ];

    public function cartel()
    {
        return $this->belongsTo(Multimedia::class, 'cartel_id');
    }

    public function galeria()
    {
        return $this->hasOne(Galeria::class, 'concierto_id');
    }
}
