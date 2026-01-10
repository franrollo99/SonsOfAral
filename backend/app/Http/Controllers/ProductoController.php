<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/productos",
     *     operationId="productosIndex",
     *     tags={"Productos"},
     *     summary="Lista productos",
     *     @OA\Response(
     *         response=200,
     *         description="Listado de productos",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request)
{
    $query = Producto::query()
        ->with(['tipo', 'imagenPrincipal'])
        ->where('activo', true);

    if ($request->filled('tipo')) {
        $query->where('tipo_producto_id', (int) $request->query('tipo'));
    }

    $order = $request->query('order', 'newest');

    match ($order) {
        'oldest'    => $query->orderBy('created_at', 'asc'),
        'price_asc' => $query->orderBy('precio', 'asc'),
        'price_desc'=> $query->orderBy('precio', 'desc'),
        default     => $query->orderBy('created_at', 'desc'),
    };

    return ProductoResource::collection($query->get());
}


    /**
     * @OA\Get(
     *     path="/api/productos/{id}",
     *     operationId="productosShow",
     *     tags={"Productos"},
     *     summary="Detalle de un producto",
     *     description="Devuelve el detalle de un producto por ID (incluye tipo e imagen principal).",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Producto encontrado",
     *         @OA\JsonContent(type="object")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Producto no encontrado"
     *     )
     * )
     */
    public function show(int $id)
    {
        $producto = Producto::with(['tipo', 'imagenPrincipal'])->findOrFail($id);

        return new ProductoResource($producto);
    }
}
