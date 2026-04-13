<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductoRequest;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use App\Services\MultimediaService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

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
     *         description="Filtrar por tipo_producto",
     *         @OA\Schema(type="string", enum={"ropa","disco","accesorio"}, example="ropa")
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
     *                     @OA\Property(property="tipo_producto", type="string", example="ropa"),
     *                     @OA\Property(property="tiene_talla", type="boolean", example=true),
     *                     @OA\Property(
     *                         property="tallas_disponibles",
     *                         type="array",
     *                         nullable=true,
     *                         @OA\Items(type="string", example="M")
     *                     ),
     *                     @OA\Property(property="precio", type="number", format="float", example=19.99),
     *                     @OA\Property(property="precio_formateado", type="string", example="19,99 €"),
     *                     @OA\Property(property="slug", type="string", example="camiseta-soa"),
     *                     @OA\Property(property="activo", type="integer", example=1),
     *                     @OA\Property(property="imagen", type="string", nullable=true, example="http://localhost/storage/productos/camiseta.webp")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Producto::query();

        $user = auth('sanctum')->user();
        $rol = $user?->rol ?? $user?->role ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

        if (!$isAdmin) {
            $query->where('activo', true);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_producto', $request->query('tipo'));
        }

        match ($request->query('order', 'newest')) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'price_asc' => $query->orderBy('precio', 'asc'),
            'price_desc' => $query->orderBy('precio', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
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
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Producto no encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Producto] 999")
     *         )
     *     )
     * )
     */
    public function show(Producto $producto)
    {
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
    public function store(ProductoRequest $request, MultimediaService $multimediaService)
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['nombre']);

        if (!$request->boolean('tiene_talla')) {
            $data['tallas_disponibles'] = [];
        }

        unset($data['imagen']);

        $producto = Producto::create($data);

        if ($request->hasFile('imagen')) {
            $media = $multimediaService->storeImage(
                $request->file('imagen'),
                'imagenes/productos'
            );

            $producto->imagen_id = $media->id;
            $producto->save();
        }

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
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Producto actualizado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Producto no encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(ProductoRequest $request, Producto $producto, MultimediaService $multimediaService)
    {
        $data = $request->validated();

        if (isset($data['nombre']) && $data['nombre'] !== $producto->nombre) {
            $data['slug'] = Str::slug($data['nombre']);
        } else {
            unset($data['slug']);
        }

        if (!$request->boolean('tiene_talla')) {
            $data['tallas_disponibles'] = [];
        }

        unset($data['imagen']);

        $producto->update($data);

        if ($request->boolean('remove_imagen')) {
            $multimediaService->delete($producto->imagen);
            $producto->imagen_id = null;
            $producto->save();
        }

        if ($request->hasFile('imagen')) {
            $media = $multimediaService->replaceImage(
                $producto->imagen,
                $request->file('imagen'),
                'imagenes/productos'
            );

            $producto->imagen_id = $media->id;
            $producto->save();
        }

        return new ProductoResource($producto->fresh('imagen'));
    }

    /**
     * @OA\Delete(
     *     path="/api/productos/{id}",
     *     operationId="productosDestroy",
     *     tags={"Productos"},
     *     summary="Eliminar producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Producto eliminado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Producto no encontrado")
     * )
     */
    public function destroy(Producto $producto, MultimediaService $multimediaService)
    {
        $multimediaService->delete($producto->imagen);

        $producto->delete();

        return response()->json(['message' => 'OK']);
    }
}