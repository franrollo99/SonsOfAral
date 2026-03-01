<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use Illuminate\Http\Response;
use App\Http\Requests\CancionRequest;
use App\Http\Resources\CancionResource;

class CancionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/canciones",
     *     summary="Obtener todas las canciones",
     *     tags={"Canciones"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de canciones",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="lanzamientoId", type="integer", example=10),
     *                     @OA\Property(property="lanzamiento", type="string", nullable=true, example="Nombre del lanzamiento"),
     *                     @OA\Property(property="titulo", type="string", example="Mi canción"),
     *                     @OA\Property(property="duracion", type="integer", description="Duración en segundos", example=225),
     *                     @OA\Property(property="duracionFormateada", type="string", example="03:45"),
     *                     @OA\Property(property="trackNumber", type="integer", nullable=true, example=1)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $canciones = Cancion::with('lanzamiento')->get();
        return CancionResource::collection($canciones);
    }

    /**
     * @OA\Post(
     *     path="/api/canciones",
     *     summary="Crear una canción",
     *     tags={"Canciones"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             required={"titulo","duracion","lanzamiento_id"},
     *             @OA\Property(property="titulo", type="string", example="Mi canción"),
     *             @OA\Property(property="duracion", type="integer", example=225),
     *             @OA\Property(property="track_number", type="integer", nullable=true, example=1),
     *             @OA\Property(property="lanzamiento_id", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Canción creada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="lanzamientoId", type="integer", example=10),
     *                 @OA\Property(property="lanzamiento", type="string", nullable=true, example="Nombre del lanzamiento"),
     *                 @OA\Property(property="titulo", type="string", example="Mi canción"),
     *                 @OA\Property(property="duracion", type="integer", example=225),
     *                 @OA\Property(property="duracionFormateada", type="string", example="03:45"),
     *                 @OA\Property(property="trackNumber", type="integer", nullable=true, example=1)
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
     *         description="Sin permisos",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 example={"titulo":{"El título de la canción es obligatorio."},"lanzamiento_id":{"El lanzamiento asociado no existe."}}
     *             )
     *         )
     *     )
     * )
     */
    public function store(CancionRequest $request)
    {
        $cancion = Cancion::create($request->validated());
        $cancion->load('lanzamiento');

        return (new CancionResource($cancion))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Get(
     *     path="/api/canciones/{id}",
     *     summary="Obtener una canción por ID",
     *     tags={"Canciones"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la canción",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información de la canción",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="lanzamientoId", type="integer", example=10),
     *                 @OA\Property(property="lanzamiento", type="string", nullable=true, example="Nombre del lanzamiento"),
     *                 @OA\Property(property="titulo", type="string", example="Mi canción"),
     *                 @OA\Property(property="duracion", type="integer", description="Duración en segundos", example=225),
     *                 @OA\Property(property="duracionFormateada", type="string", example="03:45"),
     *                 @OA\Property(property="trackNumber", type="integer", nullable=true, example=1)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Canción no encontrada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Cancion] 999")
     *         )
     *     )
     * )
     */
    public function show(int $id)
    {
        $cancion = Cancion::with('lanzamiento')->findOrFail($id);
        return new CancionResource($cancion);
    }

    /**
     * @OA\Put(
     *     path="/api/canciones/{id}",
     *     summary="Actualizar una canción",
     *     tags={"Canciones"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la canción",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             type="object",
     *             required={"titulo","duracion","lanzamiento_id"},
     *             @OA\Property(property="titulo", type="string", example="Mi canción editada"),
     *             @OA\Property(property="duracion", type="integer", example=240),
     *             @OA\Property(property="track_number", type="integer", nullable=true, example=2),
     *             @OA\Property(property="lanzamiento_id", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Canción actualizada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="lanzamientoId", type="integer", example=10),
     *                 @OA\Property(property="lanzamiento", type="string", nullable=true, example="Nombre del lanzamiento"),
     *                 @OA\Property(property="titulo", type="string", example="Mi canción editada"),
     *                 @OA\Property(property="duracion", type="integer", example=240),
     *                 @OA\Property(property="duracionFormateada", type="string", example="04:00"),
     *                 @OA\Property(property="trackNumber", type="integer", nullable=true, example=2)
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
     *         description="Sin permisos",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Canción no encontrada",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Cancion] 999"))
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(
     *                 property="errors",
     *                 type="object",
     *                 example={"titulo":{"El título de la canción es obligatorio."},"duracion":{"La duración debe ser mayor que 0."}}
     *             )
     *         )
     *     )
     * )
     */
    public function update(CancionRequest $request, int $id)
    {
        $cancion = Cancion::findOrFail($id);
        $cancion->update($request->validated());
        $cancion->load('lanzamiento');

        return new CancionResource($cancion);
    }

    /**
     * @OA\Delete(
     *     path="/api/canciones/{id}",
     *     summary="Eliminar una canción",
     *     tags={"Canciones"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la canción",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Canción eliminada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="OK")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Sin permisos",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Canción no encontrada",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Cancion] 999"))
     *     )
     * )
     */
    public function destroy(int $id)
    {
        $cancion = Cancion::findOrFail($id);
        $cancion->delete();
        
        return response()->json(['message' => 'OK']);
    }
}