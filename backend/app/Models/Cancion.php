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
    ];

    public function lanzamiento()
    {
        return $this->belongsTo(Lanzamiento::class);
    }

    public function duracionFormateada()
    {
        $min = floor($this->duracion / 60);
        $seg = $this->duracion % 60;
        return sprintf('%02d:%02d', $min, $seg);
    }
}
