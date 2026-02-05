<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductoRequest;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\ProductoResource;

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
            ->with(['tipo']);

        $user = auth('sanctum')->user();

        $rol = $user?->rol ?? $user?->role ?? null;
        $isAdmin = in_array($rol, ['admin', 'ADMIN', 'Administrador'], true);

        if (!$isAdmin) {
            $query->where('activo', true);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_producto_id', (int) $request->query('tipo'));
        }

        $order = $request->query('order', 'newest');

        match ($order) {
            'oldest'     => $query->orderBy('created_at', 'asc'),
            'price_asc'  => $query->orderBy('precio', 'asc'),
            'price_desc' => $query->orderBy('precio', 'desc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        return ProductoResource::collection($query->get());
    }


    /**
     * @OA\Post(
     *     path="/api/productos",
     *     operationId="productosStore",
     *     tags={"Productos"},
     *     summary="Crear producto",
     *     @OA\Response(
     *         response=201,
     *         description="Producto creado",
     *         @OA\JsonContent(type="object")
     *     )
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

        $producto->load(['tipo']);

        return (new ProductoResource($producto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
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
        $producto = Producto::with(['tipo'])->findOrFail($id);
        return new ProductoResource($producto);
    }

    /**
     * @OA\Put(
     *     path="/api/productos/{id}",
     *     operationId="productosUpdate",
     *     tags={"Productos"},
     *     summary="Actualizar producto",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Producto actualizado",
     *         @OA\JsonContent(type="object")
     *     )
     * )
     */
    public function update(ProductoRequest $request, int $id)
    {
        $model = Producto::findOrFail($id);
        $data = $request->validated();

        if (isset($data['nombre']) && $data['nombre'] !== $model->nombre) {
            $data['slug'] = Str::slug($data['nombre']);
        } else {
            unset($data['slug']);
        }

        unset($data['imagen']);

        $model->update($data);

        if ($request->hasFile('imagen')) {
            if (!empty($model->imagen)) {
                Storage::disk('public')->delete('productos/' . $model->imagen);
            }

            $path = $request->file('imagen')->store('productos', 'public');
            $model->imagen = basename($path);
            $model->save();
        }

        $model->load(['tipo']);

        return new ProductoResource($model);
    }

    /**
     * @OA\Delete(
     *     path="/api/productos/{id}",
     *     operationId="productosDestroy",
     *     tags={"Productos"},
     *     summary="Eliminar producto",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK"
     *     )
     * )
     */
    public function destroy(int $id)
    {
        $model = Producto::findOrFail($id);

        if (!empty($model->imagen)) {
            Storage::disk('public')->delete('productos/' . $model->imagen);
        }

        $model->delete();

        return response()->json(['message' => 'OK']);
    }
}
