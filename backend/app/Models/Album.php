<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    protected $table = 'albums';

    protected $fillable = [
        'titulo',
        'fecha_lanzamiento',
        'descripcion',
    ];

    public function canciones()
    {
        return $this->hasMany(Cancion::class);
    }
}
