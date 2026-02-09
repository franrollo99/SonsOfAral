<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use App\Models\PedidoProducto;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\PedidoResource;
use App\Http\Requests\PedidoStoreRequest;

class PedidoController extends Controller
{
    /**
     * GET /api/pedidos
     * - Admin: devuelve TODOS los pedidos
     * - Cliente: devuelve SOLO sus pedidos
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $isAdmin = ($user->role ?? $user->rol ?? null) === 'admin';

        $query = Pedido::query()->with('productos');

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        $pedidos = $query->get();

        return PedidoResource::collection($pedidos);
    }

    /**
     * GET /api/pedidos/{pedido}
     * - Admin: puede ver cualquiera
     * - Cliente: solo si es suyo
     */
    public function show(Request $request, Pedido $pedido)
    {
        $user = $request->user();

        $isAdmin = ($user->role ?? $user->rol ?? null) === 'admin';

        if (!$isAdmin && (int) $pedido->user_id !== (int) $user->id) {
            abort(403, 'No tienes permisos para ver este pedido.');
        }

        $pedido->load('productos');

        return new PedidoResource($pedido);
    }

    public function store(PedidoStoreRequest $request)
    {
        $user = $request->user();

        $data = $request->validated();

        $items = $data['items'];

        return DB::transaction(function () use ($data, $items, $user) {

            $pedido = Pedido::create([
                'user_id'      => $user->id,
                'estado'       => 'pendiente',
                'precio_total' => 0,
                'nombre_envio' => $data['nombre_envio'],
                'telefono'     => $data['telefono'] ?? null,
                'direccion'    => $data['direccion'],
                'municipio'    => $data['municipio'],
                'provincia'    => $data['provincia'],
                'cp'           => $data['cp'],
                'metodo_pago'  => $data['metodo_pago'],
                'gastos_envio' => (float) $data['gastos_envio'],
            ]);

            // 2) Cargamos productos reales
            $ids = collect($items)->pluck('id')->unique()->values();
            $productos = Producto::whereIn('id', $ids)->get()->keyBy('id');

            $subtotal = 0;

            foreach ($items as $it) {
                $producto = $productos->get((int) $it['id']);

                if (!$producto) {
                    abort(422, "Producto con id {$it['id']} no existe.");
                }

                $qty = (int) $it['qty'];
                $precioUnit = (float) ($producto->precio ?? 0);

                $lineSubtotal = $precioUnit * $qty;
                $subtotal += $lineSubtotal;

                PedidoProducto::create([
                    'pedido_id'               => $pedido->id,
                    'producto_id'             => $producto->id,
                    'nombre_producto'         => $producto->nombre,
                    'talla'                   => $it['talla'] ?? null,
                    'cantidad'                => $qty,
                    'precio_unitario_snapshot' => $precioUnit,
                    'subtotal'                => $lineSubtotal,
                ]);
            }

            // 3) Total final = subtotal + gastos
            $total = $subtotal + (float) $pedido->gastos_envio;
            $pedido->precio_total = $total;
            $pedido->save();

            $pedido->load('productos');

            return new PedidoResource($pedido);
        });
    }


    public function update(Request $request, Pedido $pedido)
    {
        $user = $request->user();
        $isAdmin = ($user->role ?? $user->rol ?? null) === 'admin';

        if (!$isAdmin) {
            abort(403, 'No tienes permisos para actualizar pedidos.');
        }

        $data = $request->validate([
            'estado' => [
                'required',
                'string',
                Rule::in(['pendiente', 'enviado', 'entregado', 'cancelado']),
            ],
        ]);

        $pedido->estado = $data['estado'];
        $pedido->save();

        // devolvemos el pedido con líneas por si el front refresca el modal
        $pedido->load('productos');

        return new PedidoResource($pedido);
    }
}
