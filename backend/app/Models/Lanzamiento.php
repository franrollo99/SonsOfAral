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
        'imagen',
        'compra_url',
        'audio_url',
        'video_url',
    ];

    public function canciones()
    {
        return $this->hasMany(Cancion::class);
    }
}
