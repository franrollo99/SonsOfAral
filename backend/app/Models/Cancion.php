<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cancion extends Model
{
    protected $table = 'canciones';

    protected $fillable = [
        'lanzamiento_id',
        'titulo',
        'duracion',
        'track_number',
    ];

    public function lanzamiento()
    {
        return $this->belongsTo(Lanzamiento::class);
    }
}
