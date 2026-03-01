<?php

namespace App\Http\Controllers;

use App\Models\Concierto;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\ConciertoRequest;
use App\Http\Resources\ConciertoResource;

class ConciertoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/conciertos",
     *     operationId="conciertosIndex",
     *     tags={"Conciertos"},
     *     summary="Obtener todos los conciertos",
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
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="fecha", type="string", format="date", example="2026-02-28"),
     *                     @OA\Property(property="fecha_formateada", type="string", nullable=true, example="28 de febrero, 2026"),
     *                     @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                     @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                     @OA\Property(property="lugar", type="string", example="Teatro Principal"),
     *                     @OA\Property(property="descripcion", type="string", nullable=true, example="Concierto presentación"),
     *                     @OA\Property(property="precioEntrada", type="number", nullable=true, example=12.5),
     *                     @OA\Property(property="entradaAnticipada", type="boolean", example=true),
     *                     @OA\Property(property="enlaceEntradaAnticipada", type="string", nullable=true, example="https://..."),
     *                     @OA\Property(property="imagen", type="string", nullable=true, example="http://localhost/storage/conciertos/cover.webp")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $conciertos = Concierto::query()
            ->orderBy('fecha', 'asc')
            ->get();

        return ConciertoResource::collection($conciertos);
    }

    /**
     * @OA\Get(
     *     path="/api/conciertos/{id}",
     *     operationId="conciertosShow",
     *     tags={"Conciertos"},
     *     summary="Obtener un concierto por ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del concierto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Concierto encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="fecha", type="string", format="date", example="2026-02-28"),
     *                 @OA\Property(property="fecha_formateada", type="string", nullable=true, example="28 de febrero, 2026"),
     *                 @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                 @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                 @OA\Property(property="lugar", type="string", example="Teatro Principal"),
     *                 @OA\Property(property="descripcion", type="string", nullable=true, example="Concierto presentación"),
     *                 @OA\Property(property="precioEntrada", type="number", nullable=true, example=12.5),
     *                 @OA\Property(property="entradaAnticipada", type="boolean", example=true),
     *                 @OA\Property(property="enlaceEntradaAnticipada", type="string", nullable=true, example="https://..."),
     *                 @OA\Property(property="imagen", type="string", nullable=true, example="http://localhost/storage/conciertos/cover.webp")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Concierto no encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Concierto] 999")
     *         )
     *     )
     * )
     */
    public function show(int $id)
    {
        $concierto = Concierto::findOrFail($id);
        return new ConciertoResource($concierto);
    }

    /**
     * @OA\Post(
     *     path="/api/conciertos",
     *     operationId="conciertosStore",
     *     tags={"Conciertos"},
     *     summary="Crear un concierto",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"fecha","lugar","entrada_anticipada"},
     *                 @OA\Property(property="fecha", type="string", format="date", example="2026-02-28"),
     *                 @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                 @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                 @OA\Property(property="lugar", type="string", example="Teatro Principal"),
     *                 @OA\Property(property="descripcion", type="string", nullable=true, example="Concierto presentación"),
     *                 @OA\Property(property="precio_entrada", type="number", nullable=true, example=12.5),
     *                 @OA\Property(property="entrada_anticipada", type="boolean", example=true),
     *                 @OA\Property(property="enlace_entrada_anticipada", type="string", nullable=true, example="https://..."),
     *                 @OA\Property(property="imagen", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Concierto creado"),
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
    public function store(ConciertoRequest $request)
    {
        $data = $request->validated();

        unset($data['imagen']);

        $concierto = Concierto::create($data);

        if ($request->hasFile('imagen')) {
            $path = $request->file('imagen')->store('conciertos', 'public');
            $concierto->imagen = basename($path);
            $concierto->save();
        }

        return (new ConciertoResource($concierto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Put(
     *     path="/api/conciertos/{id}",
     *     operationId="conciertosUpdate",
     *     tags={"Conciertos"},
     *     summary="Actualizar un concierto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del concierto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"fecha","lugar","entrada_anticipada"},
     *                 @OA\Property(property="fecha", type="string", format="date", example="2026-02-28"),
     *                 @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                 @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                 @OA\Property(property="lugar", type="string", example="Teatro Principal"),
     *                 @OA\Property(property="descripcion", type="string", nullable=true),
     *                 @OA\Property(property="precio_entrada", type="number", nullable=true, example=12.5),
     *                 @OA\Property(property="entrada_anticipada", type="boolean", example=true),
     *                 @OA\Property(property="enlace_entrada_anticipada", type="string", nullable=true, example="https://..."),
     *                 @OA\Property(property="imagen", type="string", format="binary", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Concierto actualizado"),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="Concierto no encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Concierto] 999"))),
     *     @OA\Response(response=422, description="Error de validación", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="The given data was invalid."), @OA\Property(property="errors", type="object")))
     * )
     */
    public function update(ConciertoRequest $request, int $id)
    {
        $concierto = Concierto::findOrFail($id);

        $data = $request->validated();
        unset($data['imagen']);

        $concierto->update($data);

        if ($request->hasFile('imagen')) {
            if (!empty($concierto->imagen)) {
                Storage::disk('public')->delete('conciertos/' . $concierto->imagen);
            }

            $path = $request->file('imagen')->store('conciertos', 'public');
            $concierto->imagen = basename($path);
            $concierto->save();
        }

        return new ConciertoResource($concierto);
    }

    /**
     * @OA\Delete(
     *     path="/api/conciertos/{id}",
     *     operationId="conciertosDestroy",
     *     tags={"Conciertos"},
     *     summary="Eliminar un concierto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del concierto",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Concierto eliminado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="OK"))
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="Concierto no encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\Concierto] 999")))
     * )
     */
    public function destroy(int $id)
    {
        $concierto = Concierto::findOrFail($id);

        if (!empty($concierto->imagen)) {
            Storage::disk('public')->delete('conciertos/' . $concierto->imagen);
        }

        $concierto->delete();

        return response()->json(['message' => 'OK']);
    }
}