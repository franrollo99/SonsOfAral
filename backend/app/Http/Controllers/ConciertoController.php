<?php

namespace App\Http\Controllers;

use App\Models\Concierto;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConciertoResource;

class ConciertoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/conciertos",
     *     summary="Obtener todos los conciertos",
     *     tags={"Conciertos"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de conciertos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="fecha", type="string"),
     *                     @OA\Property(property="provincia", type="string"),
     *                     @OA\Property(property="municipio", type="string"),
     *                     @OA\Property(property="lugar", type="string"),
     *                     @OA\Property(property="descripcion", type="string"),
     *                     @OA\Property(property="precioEntrada", type="number"),
     *                     @OA\Property(property="entradaAnticipada", type="boolean"),
     *                     @OA\Property(property="enlaceEntradaAnticipada", type="string", nullable=true)
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $conciertos = Concierto::orderBy('fecha', 'asc')->get();
        return ConciertoResource::collection($conciertos);
    }


    /**
     * No se usa en APIs.
     */
    public function create()
    {
        //
    }


    /**
     * No se usa en APIs.
     */
    public function store(Request $request)
    {
        //
    }


    /**
     * @OA\Get(
     *     path="/api/conciertos/{id}",
     *     summary="Obtener un concierto por ID",
     *     tags={"Conciertos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del concierto",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Información del concierto",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="fecha", type="string"),
     *             @OA\Property(property="provincia", type="string"),
     *             @OA\Property(property="municipio", type="string"),
     *             @OA\Property(property="lugar", type="string"),
     *             @OA\Property(property="descripcion", type="string"),
     *             @OA\Property(property="precioEntrada", type="number"),
     *             @OA\Property(property="entradaAnticipada", type="boolean"),
     *             @OA\Property(property="enlaceEntradaAnticipada", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Concierto no encontrado"
     *     )
     * )
     */
    public function show(string $id)
    {
        $concierto = Concierto::findOrFail($id);
        return new ConciertoResource($concierto);
    }


    public function edit(string $id)
    {
        //
    }


    public function update(Request $request, string $id)
    {
        //
    }


    public function destroy(string $id)
    {
        //
    }
}
