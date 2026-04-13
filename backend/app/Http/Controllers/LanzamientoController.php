<?php

namespace App\Http\Controllers;

use App\Http\Requests\LanzamientoRequest;
use App\Http\Resources\LanzamientoResource;
use App\Models\Lanzamiento;
use App\Services\LanzamientoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LanzamientoController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/lanzamientos",
     *     operationId="lanzamientosIndex",
     *     tags={"Lanzamientos"},
     *     summary="Obtener todos los lanzamientos",
     *     @OA\Response(
     *         response=200,
     *         description="Lista de lanzamientos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(ref="#/components/schemas/Lanzamiento")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = Lanzamiento::query()
            ->with([
                'canciones' => fn($q) => $q
                    ->with('audio')
                    ->orderBy('track_number')
                    ->select('id', 'lanzamiento_id', 'titulo', 'duracion', 'track_number', 'audio_id')
            ])
            ->orderByDesc('fecha_lanzamiento');

        return LanzamientoResource::collection($query->get());
    }

    /**
     * @OA\Get(
     *     path="/api/lanzamientos/{id}",
     *     operationId="lanzamientosShow",
     *     tags={"Lanzamientos"},
     *     summary="Obtener un lanzamiento por ID",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lanzamiento encontrado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", ref="#/components/schemas/Lanzamiento")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Lanzamiento no encontrado")
     * )
     */
    public function show(int $id)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        $lanzamiento->load([
            'canciones' => fn($q) => $q->with('audio')->orderBy('track_number')
        ]);

        return new LanzamientoResource($lanzamiento);
    }

    /**
     * @OA\Post(
     *     path="/api/lanzamientos",
     *     operationId="lanzamientosStore",
     *     tags={"Lanzamientos"},
     *     summary="Crear un lanzamiento",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Lanzamiento creado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(LanzamientoRequest $request, LanzamientoService $lanzamientoService)
    {
        $lanzamiento = $lanzamientoService->create(
            $request->validated(),
            $request
        );

        return (new LanzamientoResource($lanzamiento))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *     path="/api/lanzamientos/{id}",
     *     operationId="lanzamientosUpdate",
     *     tags={"Lanzamientos"},
     *     summary="Actualizar un lanzamiento",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(response=200, description="Lanzamiento actualizado"),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Lanzamiento no encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function update(LanzamientoRequest $request, int $id, LanzamientoService $lanzamientoService)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        $lanzamiento = $lanzamientoService->update(
            $lanzamiento,
            $request->validated(),
            $request
        );

        return new LanzamientoResource($lanzamiento);
    }

    /**
     * @OA\Delete(
     *     path="/api/lanzamientos/{id}",
     *     operationId="lanzamientosDestroy",
     *     tags={"Lanzamientos"},
     *     summary="Eliminar un lanzamiento",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lanzamiento eliminado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="OK")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="Sin permisos"),
     *     @OA\Response(response=404, description="Lanzamiento no encontrado")
     * )
     */
    public function destroy(int $id, LanzamientoService $lanzamientoService)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        $lanzamientoService->delete($lanzamiento);

        return response()->json(['message' => 'OK']);
    }
}
