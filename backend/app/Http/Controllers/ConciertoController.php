<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConciertoRequest;
use App\Http\Resources\ConciertoResource;
use App\Models\Concierto;
use App\Services\MultimediaService;
use Illuminate\Http\Response;

class ConciertoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/conciertos",
     *     operationId="conciertosIndex",
     *     tags={"Conciertos"},
     *     summary="Obtener todos los conciertos",
     *     @OA\Parameter(
     *         name="sort",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string", example="latest")
     *     ),
     *     @OA\Parameter(
     *         name="sin_galeria",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Parameter(
     *         name="all",
     *         in="query",
     *         required=false,
     *         description="Si es true, devuelve todos los conciertos. Si no, solo los actuales y futuros.",
     *         @OA\Schema(type="boolean", example=true)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de conciertos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Concierto"))
     *         )
     *     )
     * )
     */
    public function index()
    {
        $sort = request('sort');
        $all = request()->boolean('all');
        $sinGaleria = request()->boolean('sin_galeria');
        $galeriaActualId = request('galeria_actual_id');

        $query = Concierto::query();

        if (!$all) {
            $query->whereDate('fecha', '>=', now()->toDateString());
        }

        if ($sinGaleria) {
            $query->where(function ($q) use ($galeriaActualId) {
                $q->whereDoesntHave('galeria');

                if ($galeriaActualId) {
                    $q->orWhereHas('galeria', function ($sub) use ($galeriaActualId) {
                        $sub->where('id', $galeriaActualId);
                    });
                }
            });
        }

        if ($sort === 'latest') {
            $query->orderBy('fecha', 'desc');
        } else {
            $query->orderBy('fecha', 'asc');
        }

        return ConciertoResource::collection($query->get());
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
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Concierto encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", ref="#/components/schemas/Concierto")
     *         )
     *     ),
     *     @OA\Response(response=404, description="No encontrado")
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
     *                 @OA\Property(property="fecha", type="string", format="date"),
     *                 @OA\Property(property="provincia", type="string"),
     *                 @OA\Property(property="municipio", type="string"),
     *                 @OA\Property(property="lugar", type="string"),
     *                 @OA\Property(property="descripcion", type="string"),
     *                 @OA\Property(property="precio_entrada", type="number"),
     *                 @OA\Property(property="entrada_anticipada", type="boolean"),
     *                 @OA\Property(property="enlace_entrada_anticipada", type="string"),
     *                 @OA\Property(property="cartel", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Creado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(ConciertoRequest $request, MultimediaService $multimediaService)
    {
        $data = $request->validated();
        unset($data['cartel']);

        $concierto = Concierto::create($data);

        if ($request->hasFile('cartel')) {
            $media = $multimediaService->storeImage(
                $request->file('cartel'),
                'imagenes/conciertos'
            );

            $concierto->cartel_id = $media->id;
            $concierto->save();
        }

        return (new ConciertoResource($concierto->fresh('cartel')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *     path="/api/conciertos/{id}",
     *     operationId="conciertosUpdate",
     *     tags={"Conciertos"},
     *     summary="Actualizar un concierto",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Actualizado"),
     *     @OA\Response(response=404, description="No encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(ConciertoRequest $request, int $id, MultimediaService $multimediaService)
    {
        $concierto = Concierto::findOrFail($id);

        $data = $request->validated();
        unset($data['cartel']);

        $concierto->update($data);

        if ($request->hasFile('cartel')) {
            $media = $multimediaService->replaceImage(
                $concierto->cartel,
                $request->file('cartel'),
                'imagenes/conciertos'
            );

            $concierto->cartel_id = $media->id;
            $concierto->save();
        }

        return new ConciertoResource($concierto->fresh('cartel'));
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
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="OK"),
     *     @OA\Response(response=404, description="No encontrado")
     * )
     */
    public function destroy(int $id, MultimediaService $multimediaService)
    {
        $concierto = Concierto::findOrFail($id);

        $multimediaService->delete($concierto->cartel);

        $concierto->delete();

        return response()->json(['message' => 'OK']);
    }
}
