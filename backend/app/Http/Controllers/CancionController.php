<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
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
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="albumId", type="integer"),
     *                     @OA\Property(property="titulo", type="string"),
     *                     @OA\Property(property="duracion", type="integer", description="Duración en segundos"),
     *                     @OA\Property(property="trackNumber", type="integer")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $canciones = Cancion::select('id', 'album_id', 'titulo', 'duracion', 'track_number')
            ->orderBy('album_id')
            ->orderBy('id')
            ->get();

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
     *         description="ID de la canción",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información de la canción",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="albumId", type="integer"),
     *             @OA\Property(property="titulo", type="string"),
     *             @OA\Property(property="duracion", type="integer"),
     *             @OA\Property(property="trackNumber", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Canción no encontrada"
     *     )
     * )
     */
    public function show(string $id)
    {
        $cancion = Cancion::with('album')
            ->findOrFail($id);

        return new CancionResource($cancion);
    }
}
