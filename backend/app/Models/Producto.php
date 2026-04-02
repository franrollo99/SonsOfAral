<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo_producto',
        'tiene_talla',
        'tallas_disponibles',
        'precio',
        'slug',
        'activo',
        'imagen_id',
    ];

    protected $casts = [
        'tallas_disponibles' => 'array',
        'tiene_talla' => 'boolean',
        'activo' => 'boolean',
        'precio' => 'float',
    ];

    public function getPrecioFormateadoAttribute()
    {
        return number_format($this->precio, 2, ',', '.') . ' €';
    }

    public function imagen()
    {
        return $this->belongsTo(Multimedia::class, 'imagen_id');
    }
}
