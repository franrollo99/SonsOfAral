<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PedidoProducto extends Model
{
    protected $table = 'pedido_productos';

    protected $fillable = [
        'pedido_id',
        'producto_id',
        'nombre_producto',
        'talla',
        'cantidad',
        'precio_unitario_snapshot',
        'subtotal',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario_snapshot' => 'float',
        'subtotal' => 'float',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
