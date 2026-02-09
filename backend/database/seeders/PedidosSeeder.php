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

        // Datos de envío fake (para no dejar nulls si ahora son required)
        $direcciones = [
            ['nombre_envio' => 'Laura Martínez', 'direccion' => 'Calle Metal 12, 3ºA', 'municipio' => 'Santander', 'provincia' => 'Cantabria', 'cp' => '39001'],
            ['nombre_envio' => 'Fran Rodríguez', 'direccion' => 'Av. Sons of Aral 7', 'municipio' => 'Torrelavega', 'provincia' => 'Cantabria', 'cp' => '39300'],
        ];

        foreach ($userIds as $idx => $userId) {
            $envio = $direcciones[$idx % count($direcciones)];

            foreach ($estados as $estado) {
                // Puedes variar el envío si quieres (0 o 5)
                $gastosEnvio = 5.00;

                $pedido = Pedido::create([
                    'user_id'       => $userId,
                    'codigo_pedido' => $this->generateCodigoPedido(),
                    'estado'        => $estado,
                    'precio_total'  => 0,

                    // NUEVOS CAMPOS
                    'nombre_envio'  => $envio['nombre_envio'],
                    'telefono'      => null, // como quieres: NO rellenar por defecto
                    'direccion'     => $envio['direccion'],
                    'municipio'     => $envio['municipio'],
                    'provincia'     => $envio['provincia'],
                    'cp'            => $envio['cp'],
                    'metodo_pago'   => 'tarjeta',
                    'gastos_envio'  => $gastosEnvio,
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

                // Total final incluye gastos de envío
                $pedido->update([
                    'precio_total' => round($total + (float) $pedido->gastos_envio, 2),
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
