<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos';

    protected $fillable = [
        'user_id',
        'estado',
        'precio_total',
    ];

    protected $casts = [
        'precio_total' => 'float',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function productos()
    {
        return $this->hasMany(PedidoProducto::class);
    }

    public function calcularTotal()
    {
        $this->loadMissing('productos');
        $this->precio_total = $this->productos->sum('subtotal');
        $this->save();
    }

    public function cancelar()
    {
        if ($this->estado === 'pendiente') {
            $this->estado = 'cancelado';
            $this->save();
        }
    }

    public function estaEntregado()
    {
        return $this->estado === 'entregado';
    }
}
