<?php

namespace App\Http\Controllers;

use App\Models\Album;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\AlbumResource;

class AlbumController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/albums",
     *     summary="Obtener todos los álbumes",
     *     tags={"Albums"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de álbumes",
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
        $albums = Album::select('id', 'titulo', 'fecha_lanzamiento', 'descripcion')
            ->orderBy('fecha_lanzamiento', 'desc')
            ->get();

        return AlbumResource::collection($albums);
    }

    /**
     * @OA\Get(
     *     path="/api/albums/{id}",
     *     summary="Obtener un álbum por ID",
     *     tags={"Albums"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del álbum",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información del álbum con sus canciones e imagen",
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
        $album = Album::with('canciones', 'imagen')
            ->findOrFail($id);

        return new AlbumResource($album);
    }
}
