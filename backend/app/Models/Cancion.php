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
        'audio_id',
    ];

    public function lanzamiento()
    {
        return $this->belongsTo(Lanzamiento::class);
    }

    public function audio()
    {
        return $this->belongsTo(Multimedia::class, 'audio_id');
    }
}
