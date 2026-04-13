<?php

namespace App\Http\Controllers;

use App\Http\Resources\CancionResource;
use App\Models\Cancion;

class CancionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/canciones",
     *     summary="Obtener todas las canciones",
     *     tags={"Canciones"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de canciones"
     *     )
     * )
     */
    public function index()
    {
        $canciones = Cancion::with(['lanzamiento', 'audio'])->get();

        return CancionResource::collection($canciones);
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
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información de la canción"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Canción no encontrada"
     *     )
     * )
     */
    public function show(int $id)
    {
        $cancion = Cancion::with(['lanzamiento', 'audio'])->findOrFail($id);

        return new CancionResource($cancion);
    }

    /**
     * @OA\Get(
     *     path="/api/canciones/{id}/audio",
     *     summary="Obtener audio de una canción",
     *     tags={"Canciones"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Audio de la canción"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Audio no encontrado"
     *     )
     * )
     */
    public function audio(int $id)
    {
        $cancion = Cancion::with('audio')->findOrFail($id);

        if (!$cancion->audio) {
            abort(404, 'La canción no tiene audio');
        }

        $path = storage_path(
            'app/public/' .
                $cancion->audio->directorio . '/' .
                $cancion->audio->archivo
        );

        if (!file_exists($path)) {
            abort(404, 'Archivo no encontrado');
        }

        return response()->file($path, [
            'Content-Type' => $cancion->audio->mime_type ?? 'audio/mpeg',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
}
