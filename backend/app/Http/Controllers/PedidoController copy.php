<?php

namespace App\Http\Controllers;

use App\Http\Resources\PedidoResource;
use App\Models\Pedido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/pedidos",
     *     summary="Obtener los pedidos del usuario autenticado",
     *     tags={"Pedidos"},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Lista de pedidos del usuario",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="total", type="number", format="float"),
     *                     @OA\Property(property="estado", type="string"),
     *                     @OA\Property(property="created_at", type="string")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $pedidos = Pedido::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'data' => PedidoResource::collection($pedidos),
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/pedidos/{id}",
     *     summary="Obtener un pedido concreto del usuario autenticado",
     *     tags={"Pedidos"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del pedido",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Pedido encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="total", type="number", format="float"),
     *                 @OA\Property(property="estado", type="string"),
     *                 @OA\Property(
     *                     property="productos",
     *                     type="array",
     *                     @OA\Items(
     *                         type="object",
     *                         @OA\Property(property="id", type="integer"),
     *                         @OA\Property(property="nombre", type="string"),
     *                         @OA\Property(property="cantidad", type="integer"),
     *                         @OA\Property(property="precio", type="number", format="float")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Pedido no encontrado"
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     )
     * )
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $pedido = Pedido::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('productos')
            ->first();

        if (!$pedido) {
            return response()->json([
                'message' => 'Pedido no encontrado.',
            ], 404);
        }

        return response()->json([
            'data' => new PedidoResource($pedido),
        ]);
    }
}
