<?php

namespace Database\Seeders;

use App\Models\Pedido;
use App\Models\PedidoProducto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PedidosSeeder extends Seeder
{
    public function run(): void
    {
        $productos = DB::table('productos')
            ->select('id', 'nombre', 'precio', 'tallas_disponibles', 'activo')
            ->where('activo', 1)
            ->get();

        if ($productos->isEmpty()) {
            return;
        }

        $estados = ['pendiente', 'enviado', 'entregado', 'entregado', 'cancelado'];

        $userIds = [2, 3];

        foreach ($userIds as $userId) {
            foreach ($estados as $estado) {
                $pedido = Pedido::create([
                    'user_id'       => $userId,
                    'codigo_pedido' => $this->generateCodigoPedido(),
                    'estado'        => $estado,
                    'precio_total'  => 0,
                ]);

                $total = 0.0;
                $numLineas = rand(1, 3);
                $productosPedido = $productos->shuffle()->take($numLineas);

                foreach ($productosPedido as $prod) {
                    $cantidad = rand(1, 2);
                    $precio   = (float) $prod->precio;

                    $talla = $this->pickTalla($prod->tallas_disponibles);

                    $subtotal = round($cantidad * $precio, 2);
                    $total += $subtotal;

                    PedidoProducto::create([
                        'pedido_id'                => $pedido->id,
                        'producto_id'              => $prod->id,
                        'nombre_producto'          => $prod->nombre,
                        'talla'                    => $talla,
                        'cantidad'                 => $cantidad,
                        'precio_unitario_snapshot' => $precio,
                        'subtotal'                 => $subtotal,
                    ]);
                }

                $pedido->update([
                    'precio_total' => round($total, 2),
                ]);
            }
        }
    }

    private function generateCodigoPedido(): string
    {
        do {
            $codigo = (string) rand(10000000, 99999999);
        } while (Pedido::where('codigo_pedido', $codigo)->exists());

        return $codigo;
    }

    private function pickTalla($tallasDisponibles): ?string
    {
        if (empty($tallasDisponibles)) {
            return null;
        }

        $tallas = is_string($tallasDisponibles)
            ? json_decode($tallasDisponibles, true)
            : $tallasDisponibles;

        if (!is_array($tallas) || count($tallas) === 0) {
            return null;
        }

        return $tallas[array_rand($tallas)];
    }
}
