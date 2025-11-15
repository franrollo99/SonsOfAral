<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'pedidos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'es_ropa',
        'tallas_disponibles',
        'precio',
        'slug',
        'activo',
    ];

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

    public function esRopa()
    {
        return $this->es_ropa;
    }
}
