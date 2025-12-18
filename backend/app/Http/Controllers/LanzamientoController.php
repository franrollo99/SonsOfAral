<?php

namespace App\Http\Controllers;

use App\Models\Lanzamiento;
use App\Http\Controllers\Controller;
use App\Http\Resources\LanzamientoResource;

class LanzamientoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/lanzamientos",
     *     summary="Obtener todos los lanzamientos",
     *     tags={"Lanzamientos"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de lanzamientos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="titulo", type="string"),
     *                     @OA\Property(property="fechaLanzamiento", type="string"),
     *                     @OA\Property(property="descripcion", type="string")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $lanzamientos = Lanzamiento::orderBy('fecha_lanzamiento', 'desc')->get();
        return LanzamientoResource::collection($lanzamientos);
    }

    /**
     * @OA\Get(
     *     path="/api/lanzamientos/{id}",
     *     summary="Obtener un lanzamiento por ID",
     *     tags={"Lanzamientos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del lanzamiento",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información del lanzamiento con sus canciones e imagen",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="titulo", type="string"),
     *             @OA\Property(property="fechaLanzamiento", type="string"),
     *             @OA\Property(property="descripcion", type="string"),
     * 
     *             @OA\Property(
     *                 property="canciones",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="titulo", type="string"),
     *                     @OA\Property(property="duracion", type="integer")
     *                 )
     *             ),
     *
     *             @OA\Property(
     *                 property="imagen",
     *                 type="object",
     *                 nullable=true,
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="url", type="string"),
     *                 @OA\Property(property="alt", type="string"),
     *                 @OA\Property(property="mime", type="string"),
     *                 @OA\Property(property="esPrincipal", type="boolean")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Álbum no encontrado"
     *     )
     * )
     */
    public function show(string $id)
    {
        $lanzamiento = Lanzamiento::with('canciones', 'imagen')
            ->findOrFail($id);

        return new LanzamientoResource($lanzamiento);
    }
}
