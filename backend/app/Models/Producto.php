<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'es_ropa',
        'tallas_disponibles',
        'precio',
        'slug',
        'activo',
    ];

    protected $casts = [
        'es_ropa' => 'boolean',
        'activo' => 'boolean',
        'precio' => 'float',
    ];

    public function pedidoProductos()
    {
        return $this->hasMany(PedidoProducto::class);
    }

    public function imagenes()
    {
        return $this->hasMany(Imagen::class);
    }

    public function imagenPrincipal()
    {
        return $this->hasOne(Imagen::class)->where('es_principal', true);
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
