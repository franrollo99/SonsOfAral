<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    protected $table = 'pedidos';

    protected $fillable = [
        'user_id',
        'codigo_pedido',
        'estado',
        'precio_total',
    ];

    protected $casts = [
        'precio_total' => 'float',
    ];

    protected static function booted(): void
    {
        static::creating(function (Pedido $pedido) {
            if (empty($pedido->codigo_pedido)) {
                $pedido->codigo_pedido = self::generateCodigoPedido();
            }

            if ($pedido->precio_total === null) {
                $pedido->precio_total = 0;
            }
        });
    }

    private static function generateCodigoPedido(): string
    {
        do {
            $codigo = (string) random_int(10000000, 99999999);
        } while (self::where('codigo_pedido', $codigo)->exists());

        return $codigo;
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function productos()
    {
        return $this->hasMany(PedidoProducto::class, 'pedido_id');
    }

    public function calcularTotal(): void
    {
        $this->loadMissing('productos');
        $this->precio_total = (float) $this->productos->sum('subtotal');
        $this->save();
    }

    public function cancelar(): void
    {
        if ($this->estado === 'pendiente') {
            $this->estado = 'cancelado';
            $this->save();
        }
    }

    public function estaEntregado(): bool
    {
        return $this->estado === 'entregado';
    }
}
