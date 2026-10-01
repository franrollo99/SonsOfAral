<?php

namespace App\Http\Controllers;

use App\Http\Requests\GaleriaRequest;
use App\Http\Resources\GaleriaResource;
use App\Models\Galeria;
use App\Services\GaleriaService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class GaleriaController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/galerias",
     *     operationId="galeriasIndex",
     *     tags={"Galerias"},
     *     summary="Listar galerías",
     *
     *     @OA\Parameter(
     *         name="tipo",
     *         in="query",
     *         required=false,
     *         description="Filtrar por tipo de galería",
     *
     *         @OA\Schema(type="string", enum={"concierto","banda"}, example="concierto")
     *     ),
     *
     *     @OA\Parameter(
     *         name="solo_con_imagenes",
     *         in="query",
     *         required=false,
     *         description="Mostrar solo galerías que tengan imágenes",
     *
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Listado de galerías",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(ref="#/components/schemas/Galeria")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Galeria::with(['concierto', 'portada', 'imagenes']);

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->boolean('solo_con_imagenes')) {
            $query->whereHas('imagenes');
        }

        $galerias = $query
            ->latest()
            ->get();

        return GaleriaResource::collection($galerias);
    }

    /**
     * @OA\Post(
     *     path="/api/galerias",
     *     operationId="galeriasStore",
     *     tags={"Galerias"},
     *     summary="Crear una galería",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *                 type="object",
     *                 required={"tipo"},
     *
     *                 @OA\Property(property="tipo", type="string", enum={"concierto","banda"}, example="concierto"),
     *                 @OA\Property(property="concierto_id", type="integer", nullable=true, example=1),
     *                 @OA\Property(property="titulo", type="string", nullable=true, example="Galería presentación"),
     *                 @OA\Property(property="portada", type="string", format="binary", nullable=true),
     *                 @OA\Property(
     *                     property="imagenes[]",
     *                     type="array",
     *
     *                     @OA\Items(type="string", format="binary")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=201, description="Galería creada"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(GaleriaRequest $request, GaleriaService $galeriaService)
    {
        $galeria = $galeriaService->create(
            $request->validated(),
            $request->file('portada'),
            $request->file('imagenes', [])
        );

        return (new GaleriaResource($galeria))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/galerias/{id}",
     *     operationId="galeriasShow",
     *     tags={"Galerias"},
     *     summary="Ver una galería",
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Galería encontrada",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Galeria")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Galería no encontrada")
     * )
     */
    public function show(int $id)
    {
        $galeria = Galeria::with(['concierto', 'portada', 'imagenes'])->findOrFail($id);

        return new GaleriaResource($galeria);
    }

    /**
     * @OA\Post(
     *     path="/api/galerias/{id}",
     *     operationId="galeriasUpdate",
     *     tags={"Galerias"},
     *     summary="Actualizar una galería",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *
     *             @OA\Schema(
     *                 type="object",
     *
     *                 @OA\Property(property="_method", type="string", example="PUT"),
     *                 @OA\Property(property="tipo", type="string", enum={"concierto","banda"}, example="banda"),
     *                 @OA\Property(property="concierto_id", type="integer", nullable=true, example=1),
     *                 @OA\Property(property="titulo", type="string", nullable=true, example="Galería actualizada"),
     *                 @OA\Property(property="portada", type="string", format="binary", nullable=true),
     *                 @OA\Property(property="remove_portada", type="boolean", example=false),
     *                 @OA\Property(property="remove_imagen_ids", type="string", example="[3,4]"),
     *                 @OA\Property(
     *                     property="imagenes[]",
     *                     type="array",
     *
     *                     @OA\Items(type="string", format="binary")
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(response=200, description="Galería actualizada"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Galería no encontrada"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(GaleriaRequest $request, int $id, GaleriaService $galeriaService)
    {
        $galeria = $galeriaService->update(
            Galeria::findOrFail($id),
            $request->validated(),
            $request->file('portada'),
            $request->file('imagenes', [])
        );

        return new GaleriaResource($galeria);
    }

    /**
     * @OA\Delete(
     *     path="/api/galerias/{id}",
     *     operationId="galeriasDestroy",
     *     tags={"Galerias"},
     *     summary="Eliminar una galería",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Galería eliminada",
     *
     *         @OA\JsonContent(
     *             type="object",
     *
     *             @OA\Property(property="message", type="string", example="OK")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Galería no encontrada")
     * )
     */
    public function destroy(int $id, GaleriaService $galeriaService)
    {
        $galeriaService->delete(Galeria::findOrFail($id));

        return response()->json(['message' => 'OK']);
    }
}
