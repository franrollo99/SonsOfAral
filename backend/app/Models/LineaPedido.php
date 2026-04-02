<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LineaPedido extends Model
{
    protected $table = 'lineas_pedido';

    protected $fillable = [
        'pedido_id',
        'nombre_producto',
        'talla',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_unitario' => 'float',
        'subtotal' => 'float',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }
}
