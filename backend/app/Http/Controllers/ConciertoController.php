<?php

namespace App\Http\Controllers;

use App\Models\Concierto;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;
use App\Http\Requests\ConciertoRequest;
use Illuminate\Support\Facades\Storage;
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
        return ConciertoResource::collection(
            Concierto::orderBy('fecha', 'asc')->get()
        );
    }

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
        return new ConciertoResource(
            Concierto::findOrFail($id)
        );
    }

    public function update(ConciertoRequest $request, string $id)
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

    public function destroy(string $id)
    {
        $concierto = Concierto::findOrFail($id);

        if (!empty($concierto->imagen)) {
            Storage::disk('public')->delete('conciertos/' . $concierto->imagen);
        }

        $concierto->delete();

        return response()->json(['message' => 'OK']);
    }
}
