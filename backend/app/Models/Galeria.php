<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeria extends Model
{
    protected $table = 'galerias';

    protected $fillable = [
        'tipo',
        'titulo',
        'concierto_id',
        'portada_id',
    ];

    public function concierto()
    {
        return $this->belongsTo(Concierto::class);
    }

    public function portada()
    {
        return $this->belongsTo(Multimedia::class, 'portada_id');
    }

    public function multimedia()
    {
        return $this->hasMany(Multimedia::class);
    }

    public function imagenes()
    {
        return $this->hasMany(Multimedia::class)->where('tipo', 'imagen');
    }

    public function getNombreAttribute()
    {
        if ($this->tipo === 'concierto' && $this->concierto) {
            return $this->concierto->lugar . ' - ' . $this->concierto->fecha;
        }

        return $this->titulo;
    }
}