<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'tipo_producto_id',
        'nombre',
        'descripcion',
        'tallas_disponibles',
        'precio',
        'slug',
        'activo',
        'imagen',
    ];

    protected $casts = [
        'tallas_disponibles' => 'array',
        'tipo_producto_id' => 'integer',
        'activo' => 'boolean',
        'precio' => 'float',
    ];


    public function tipo()
    {
        return $this->belongsTo(TipoProducto::class, 'tipo_producto_id');
    }

    public function pedidoProductos()
    {
        return $this->hasMany(PedidoProducto::class);
    }

    public function activar()
    {
        $this->activo = true;
        $this->save();
    }

    public function desactivar()
    {
        $this->activo = false;
        $this->save();
    }

    public function getPrecioFormateadoAttribute()
    {
        return number_format($this->precio, 2, ',', '.') . ' €';
    }
}
