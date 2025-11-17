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
        'album_id',
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

    public function album()
    {
        return $this->belongsTo(Album::class);
    }

    public function galeria()
    {
        return $this->belongsTo(Galeria::class);
    }
}
