<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use Illuminate\Http\Request;
use App\Models\LineaPedido;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\PedidoResource;
use App\Http\Requests\PedidoStoreRequest;

class PedidoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/pedidos",
     *     operationId="pedidosIndex",
     *     tags={"Pedidos"},
     *     summary="Lista pedidos (cliente: los suyos / admin: todos)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de pedidos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="codigo_pedido", type="string", example="SOA-2026-0001"),
     *                     @OA\Property(property="estado", type="string", example="pendiente"),
     *                     @OA\Property(property="precio_total", type="number", format="float", example=44.97),
     *                     @OA\Property(property="created_at", type="string", example="2026-02-28T20:57:00.000000Z"),
     *                     @OA\Property(property="nombre_envio", type="string", example="Fran Pérez"),
     *                     @OA\Property(property="direccion", type="string", example="Calle X 12"),
     *                     @OA\Property(property="municipio", type="string", example="Torrelavega"),
     *                     @OA\Property(property="provincia", type="string", example="Cantabria"),
     *                     @OA\Property(property="cp", type="string", example="39300"),
     *                     @OA\Property(property="gastos_envio", type="number", format="float", example=4.99),
     *                     @OA\Property(property="metodo_pago", type="string", example="tarjeta"),
     *                     @OA\Property(
     *                         property="lineasPedido",
     *                         type="array",
     *                         @OA\Items(
     *                             type="object",
     *                             @OA\Property(property="id", type="integer", example=10),
     *                             @OA\Property(property="nombre", type="string", example="Camiseta SoA"),
     *                             @OA\Property(property="talla", type="string", nullable=true, example="L"),
     *                             @OA\Property(property="cantidad", type="integer", example=2),
     *                             @OA\Property(property="precio_unitario", type="number", format="float", example=19.99),
     *                             @OA\Property(property="subtotal", type="number", format="float", example=39.98)
     *                         )
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     )
     * )
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $rol = $user->role ?? $user->rol ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

        $query = Pedido::query()->with('lineasPedido');

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        return PedidoResource::collection($query->get());
    }

    /**
     * @OA\Get(
     *     path="/api/pedidos/{pedido}",
     *     operationId="pedidosShow",
     *     tags={"Pedidos"},
     *     summary="Detalle de un pedido (cliente: solo suyo / admin: cualquiera)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pedido",
     *         in="path",
     *         required=true,
     *         description="ID del pedido",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pedido encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="codigo_pedido", type="string", example="SOA-2026-0001"),
     *                 @OA\Property(property="estado", type="string", example="pendiente"),
     *                 @OA\Property(property="precio_total", type="number", format="float", example=44.97),
     *                 @OA\Property(property="created_at", type="string", example="2026-02-28T20:57:00.000000Z"),
     *                 @OA\Property(property="nombre_envio", type="string", example="Fran Pérez"),
     *                 @OA\Property(property="direccion", type="string", example="Calle X 12"),
     *                 @OA\Property(property="municipio", type="string", example="Torrelavega"),
     *                 @OA\Property(property="provincia", type="string", example="Cantabria"),
     *                 @OA\Property(property="cp", type="string", example="39300"),
     *                 @OA\Property(property="gastos_envio", type="number", format="float", example=4.99),
     *                 @OA\Property(property="metodo_pago", type="string", example="tarjeta"),
     *                 @OA\Property(
     *                 property="lineasPedido",
     *                 type="array",
     *                 @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=10),
     *                         @OA\Property(property="nombre", type="string", example="Camiseta SoA"),
     *                         @OA\Property(property="talla", type="string", nullable=true, example="L"),
     *                         @OA\Property(property="cantidad", type="integer", example=2),
     *                         @OA\Property(property="precio_unitario", type="number", format="float", example=19.99),
     *                         @OA\Property(property="subtotal", type="number", format="float", example=39.98)
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Sin permisos (pedido de otro usuario)",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No tienes permisos para ver este pedido."))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No encontrado (pedido inexistente)",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Pedido] 999"))
     *     )
     * )
     */
    public function show(Request $request, Pedido $pedido)
    {
        $user = $request->user();

        $rol = $user->role ?? $user->rol ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

        if (!$isAdmin && (int) $pedido->user_id !== (int) $user->id) {
            abort(403, 'No tienes permisos para ver este pedido.');
        }

        $pedido->load('lineasPedido');

        return new PedidoResource($pedido);
    }

    /**
     * @OA\Post(
     *     path="/api/pedidos",
     *     operationId="pedidosStore",
     *     tags={"Pedidos"},
     *     summary="Crear pedido (cliente autenticado)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre_envio","direccion","municipio","provincia","cp","metodo_pago","gastos_envio","items"},
     *             @OA\Property(property="nombre_envio", type="string", example="Fran Pérez"),
     *             @OA\Property(property="telefono", type="string", nullable=true, example="600111222"),
     *             @OA\Property(property="direccion", type="string", example="Calle X 12"),
     *             @OA\Property(property="municipio", type="string", example="Torrelavega"),
     *             @OA\Property(property="provincia", type="string", example="Cantabria"),
     *             @OA\Property(property="cp", type="string", example="39300"),
     *             @OA\Property(property="metodo_pago", type="string", enum={"tarjeta","contra_reembolso"}, example="tarjeta"),
     *             @OA\Property(property="gastos_envio", type="number", format="float", example=4.99),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     required={"id","qty"},
     *                     @OA\Property(property="id", type="integer", example=2),
     *                     @OA\Property(property="qty", type="integer", example=1),
     *                     @OA\Property(property="talla", type="string", nullable=true, example="L")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Pedido creado",
     *         @OA\JsonContent(type="object", @OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación / producto inexistente",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
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

                LineaPedido::create([
                    'pedido_id'                => $pedido->id,
                    'nombre_producto'          => $producto->nombre,
                    'talla'                    => $it['talla'] ?? null,
                    'cantidad'                 => $qty,
                    'precio_unitario' => $precioUnit,
                    'subtotal'                 => $lineSubtotal,
                ]);
            }

            $pedido->precio_total = $subtotal + (float) $pedido->gastos_envio;
            $pedido->save();

            $pedido->load('lineasPedido');

            return (new PedidoResource($pedido))
                ->response()
                ->setStatusCode(201);
        });
    }

    /**
     * @OA\Put(
     *     path="/api/pedidos/{pedido}",
     *     operationId="pedidosUpdate",
     *     tags={"Pedidos"},
     *     summary="Actualizar estado del pedido (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="pedido",
     *         in="path",
     *         required=true,
     *         description="ID del pedido",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"estado"},
     *             @OA\Property(property="estado", type="string", enum={"pendiente","enviado","entregado","cancelado"}, example="enviado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pedido actualizado",
     *         @OA\JsonContent(type="object", @OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Sin permisos",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No tienes permisos para actualizar pedidos."))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No encontrado (pedido inexistente)",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Pedido] 999"))
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function update(Request $request, Pedido $pedido)
    {
        $user = $request->user();

        $rol = $user->role ?? $user->rol ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

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

        $pedido->load('lineasPedido');

        return new PedidoResource($pedido);
    }
}
