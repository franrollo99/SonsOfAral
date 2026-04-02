<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multimedia extends Model
{
    protected $table = 'multimedia';

    protected $fillable = [
        'archivo',
        'nombre_original',
        'tipo',
        'mime_type',
        'peso',
        'galeria_id',
    ];

    protected $casts = [
        'peso' => 'integer',
    ];

    public function galeria()
    {
        return $this->belongsTo(Galeria::class);
    }

    public function getUrlAttribute()
    {
        return $this->archivo ? asset('storage/' . $this->archivo) : null;
    }
}