<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
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
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="lanzamientoId", type="integer"),
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
        $canciones = Cancion::with('lanzamiento')->get();
        return CancionResource::collection($canciones);
    }


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
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información de la canción",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="lanzamientoId", type="integer"),
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
        $cancion = Cancion::with('lanzamiento')
            ->findOrFail($id);

        return new CancionResource($cancion);
    }

    public function update(CancionRequest $request, string $id)
    {
        $cancion = Cancion::findOrFail($id);
        $cancion->update($request->validated());
        $cancion->load('lanzamiento');

        return new CancionResource($cancion);
    }

    public function destroy(string $id)
    {
        Cancion::findOrFail($id)->delete();

        return response()->json(['message' => 'OK']);
    }
}
