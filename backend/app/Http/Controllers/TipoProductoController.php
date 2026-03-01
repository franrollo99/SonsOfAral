<?php

namespace App\Http\Controllers;

use App\Http\Requests\TipoProductoRequest;
use App\Http\Resources\TipoProductoResource;
use App\Models\TipoProducto;
use Illuminate\Http\Response;

class TipoProductoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/tipos-productos",
     *     operationId="tiposProductosIndex",
     *     tags={"TiposProductos"},
     *     summary="Lista de tipos de producto (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de tipos de producto",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre", type="string", example="Camisetas")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized.")))
     * )
     */
    public function index()
    {
        $tipos = TipoProducto::orderBy('nombre')->get();
        return TipoProductoResource::collection($tipos);
    }

    /**
     * @OA\Post(
     *     path="/api/tipos-productos",
     *     operationId="tiposProductosStore",
     *     tags={"TiposProductos"},
     *     summary="Crear tipo de producto (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Camisetas")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Tipo de producto creado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nombre", type="string", example="Camisetas")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
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
    public function store(TipoProductoRequest $request)
    {
        $tipoProducto = TipoProducto::create($request->validated());

        return (new TipoProductoResource($tipoProducto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/tipos-productos/{tipoProducto}",
     *     operationId="tiposProductosShow",
     *     tags={"TiposProductos"},
     *     summary="Detalle de un tipo de producto (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tipoProducto",
     *         in="path",
     *         required=true,
     *         description="ID del tipo de producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tipo de producto encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nombre", type="string", example="Camisetas")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="No encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\TipoProducto] 999")))
     * )
     */
    public function show(TipoProducto $tipoProducto)
    {
        return new TipoProductoResource($tipoProducto);
    }

    /**
     * @OA\Put(
     *     path="/api/tipos-productos/{tipoProducto}",
     *     operationId="tiposProductosUpdate",
     *     tags={"TiposProductos"},
     *     summary="Actualizar tipo de producto (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tipoProducto",
     *         in="path",
     *         required=true,
     *         description="ID del tipo de producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Sudaderas")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tipo de producto actualizado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="nombre", type="string", example="Sudaderas")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="No encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\TipoProducto] 999"))),
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
    public function update(TipoProductoRequest $request, TipoProducto $tipoProducto)
    {
        $tipoProducto->update($request->validated());
        return new TipoProductoResource($tipoProducto);
    }

    /**
     * @OA\Delete(
     *     path="/api/tipos-productos/{tipoProducto}",
     *     operationId="tiposProductosDestroy",
     *     tags={"TiposProductos"},
     *     summary="Eliminar tipo de producto (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="tipoProducto",
     *         in="path",
     *         required=true,
     *         description="ID del tipo de producto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=204, description="Eliminado (sin contenido)"),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="No encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\TipoProducto] 999")))
     * )
     */
    public function destroy(TipoProducto $tipoProducto)
    {
        $tipoProducto->delete();
        
        return response()->json(['message' => 'OK']);
    }
}