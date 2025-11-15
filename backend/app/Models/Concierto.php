<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Concierto extends Model
{
    protected $table = 'conciertos';

    protected $fillable = [
        'fecha',
        'lugar',
        'ciudad',
        'descripcion',
        'precio_entrada',
        'entrada_anticipada',
        'enlace_entrada_anticipada',
    ];

    public function esProximo()
    {
        return $this->fecha > now();
    }

    public function tieneEntradaAnticipada()
    {
        return $this->entrada_anticipada && $this->enlace_entrada_anticipada;
    }
}
