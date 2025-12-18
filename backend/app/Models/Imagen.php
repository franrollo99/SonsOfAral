<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Imagen extends Model
{
    protected $table = 'imagenes';

    protected $fillable = [
        'ruta',
        'alt',
        'mime',
        'producto_id',
        'concierto_id',
        'lanzamiento_id',
        'galeria_id',
        'es_principal',
    ];

    protected $casts = [
        'es_principal' => 'boolean',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }

    public function concierto()
    {
        return $this->belongsTo(Concierto::class);
    }

    public function lanzamiento()
    {
        return $this->belongsTo(Lanzamiento::class);
    }

    public function galeria()
    {
        return $this->belongsTo(Galeria::class);
    }
}
