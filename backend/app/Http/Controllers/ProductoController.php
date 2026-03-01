<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\ProductoRequest;
use App\Http\Resources\ProductoResource;

class ProductoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/productos",
     *     operationId="productosIndex",
     *     tags={"Productos"},
     *     summary="Lista de productos",
     *     description="Devuelve productos activos para usuarios normales y todos para admin. Permite filtro por tipo y ordenación.",
     *     @OA\Parameter(
     *         name="tipo",
     *         in="query",
     *         required=false,
     *         description="Filtrar por tipo_producto_id",
     *         @OA\Schema(type="integer", example=2)
     *     ),
     *     @OA\Parameter(
     *         name="order",
     *         in="query",
     *         required=false,
     *         description="Ordenación: newest, oldest, price_asc, price_desc",
     *         @OA\Schema(type="string", enum={"newest","oldest","price_asc","price_desc"}, example="newest")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Listado de productos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre", type="string", example="Camiseta SoA"),
     *                     @OA\Property(property="descripcion", type="string", nullable=true),
     *                     @OA\Property(property="tallas_disponibles", type="string", nullable=true, example="S,M,L"),
     *                     @OA\Property(property="precio", type="number", example=19.99),
     *                     @OA\Property(property="precio_formateado", type="string", example="19,99 €"),
     *                     @OA\Property(property="slug", type="string", example="camiseta-soa"),
     *                     @OA\Property(property="activo", type="integer", example=1),
     *                     @OA\Property(property="imagen", type="string", nullable=true, example="http://localhost/storage/productos/camiseta.webp"),
     *                     @OA\Property(property="tipo_producto_id", type="integer", example=2),
     *                     @OA\Property(
     *                         property="tipo",
     *                         type="object",
     *                         nullable=true,
     *                         @OA\Property(property="id", type="integer", example=2),
     *                         @OA\Property(property="nombre", type="string", example="Camisetas")
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Producto::with('tipo');

        $user = auth('sanctum')->user();
        $rol = $user?->rol ?? $user?->role ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

        if (!$isAdmin) {
            $query->where('activo', true);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_producto_id', (int) $request->query('tipo'));
        }

        match ($request->query('order', 'newest')) {
            'oldest'     => $query->orderBy('created_at', 'asc'),
            'price_asc'  => $query->orderBy('precio', 'asc'),
            'price_desc' => $query->orderBy('precio', 'desc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        return ProductoResource::collection($query->get());
    }

    /**
     * @OA\Get(
     *     path="/api/productos/{id}",
     *     operationId="productosShow",
     *     tags={"Productos"},
     *     summary="Detalle de producto",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Producto encontrado",
     *         @OA\JsonContent(type="object",
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Producto no encontrado",
     *         @OA\JsonContent(type="object",
     *             @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Producto] 999")
     *         )
     *     )
     * )
     */
    public function show(int $id)
    {
        $producto = Producto::with('tipo')->findOrFail($id);
        return new ProductoResource($producto);
    }

    /**
     * @OA\Post(
     *     path="/api/productos",
     *     operationId="productosStore",
     *     tags={"Productos"},
     *     summary="Crear producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Producto creado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(ProductoRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['nombre']);

        unset($data['imagen']);

        $producto = Producto::create($data);

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('productos', 'public');
            $producto->imagen = basename($path);
            $producto->save();
        }

        $producto->load('tipo');

        return (new ProductoResource($producto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Put(
     *     path="/api/productos/{id}",
     *     operationId="productosUpdate",
     *     tags={"Productos"},
     *     summary="Actualizar producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Producto actualizado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Producto no encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(ProductoRequest $request, int $id)
    {
        $producto = Producto::findOrFail($id);

        $data = $request->validated();

        if (isset($data['nombre']) && $data['nombre'] !== $producto->nombre) {
            $data['slug'] = Str::slug($data['nombre']);
        } else {
            unset($data['slug']);
        }

        unset($data['imagen']);

        $producto->update($data);

        if ($request->hasFile('imagen')) {
            if (!empty($producto->imagen)) {
                Storage::disk('public')->delete('productos/' . $producto->imagen);
            }

            $path = $request->file('imagen')->store('productos', 'public');
            $producto->imagen = basename($path);
            $producto->save();
        }

        $producto->load('tipo');

        return new ProductoResource($producto);
    }

    /**
     * @OA\Delete(
     *     path="/api/productos/{id}",
     *     operationId="productosDestroy",
     *     tags={"Productos"},
     *     summary="Eliminar producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Producto eliminado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function destroy(int $id)
    {
        $producto = Producto::findOrFail($id);

        if (!empty($producto->imagen)) {
            Storage::disk('public')->delete('productos/' . $producto->imagen);
        }

        $producto->delete();
        
        return response()->json(['message' => 'OK']);
    }
}