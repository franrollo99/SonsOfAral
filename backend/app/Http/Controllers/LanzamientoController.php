<?php

namespace App\Http\Controllers;

use App\Models\Lanzamiento;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\LanzamientoRequest;
use App\Http\Resources\LanzamientoResource;

class LanzamientoController extends Controller
{
    /**
     * @OA\Tag(
     *   name="Lanzamientos"
     * )
     */

    /**
     * @OA\Get(
     *   path="/api/lanzamientos",
     *   operationId="lanzamientosIndex",
     *   summary="Listar lanzamientos",
     *   tags={"Lanzamientos"},
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(
     *         property="data",
     *         type="array",
     *         @OA\Items(ref="#/components/schemas/Lanzamiento")
     *       )
     *     )
     *   )
     * )
     */
    public function index(Request $request)
{
    $query = Lanzamiento::query()
        ->with([
            'canciones' => fn ($q) => $q
                ->orderBy('track_number')
                ->select('id', 'lanzamiento_id', 'titulo', 'duracion', 'track_number')
        ])
        ->orderByDesc('fecha_lanzamiento');

    return LanzamientoResource::collection($query->get());
}

    /**
     * @OA\Get(
     *   path="/api/lanzamientos/{id}",
     *   operationId="lanzamientosShow",
     *   summary="Ver un lanzamiento",
     *   tags={"Lanzamientos"},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="data", ref="#/components/schemas/Lanzamiento")
     *     )
     *   ),
     *   @OA\Response(response=404, description="Not Found")
     * )
     */
    public function show(int $id)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        $lanzamiento->load([
            'canciones' => fn($q) => $q->orderBy('track_number')
        ]);

        return new LanzamientoResource($lanzamiento);
    }

    /**
     * @OA\Post(
     *   path="/api/lanzamientos",
     *   operationId="lanzamientosStore",
     *   summary="Crear lanzamiento (admin)",
     *   tags={"Lanzamientos"},
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         type="object",
     *         @OA\Property(property="titulo", type="string"),
     *         @OA\Property(property="tipo", type="string", nullable=true),
     *         @OA\Property(property="fecha_lanzamiento", type="string", format="date", nullable=true),
     *         @OA\Property(property="descripcion", type="string", nullable=true),
     *         @OA\Property(property="compra_url", type="string", nullable=true),
     *         @OA\Property(property="audio_url", type="string", nullable=true),
     *         @OA\Property(property="video_url", type="string", nullable=true),
     *         @OA\Property(property="imagen", type="string", format="binary", nullable=true),
     *         @OA\Property(
     *           property="canciones",
     *           description="JSON string. Ej: [{\"titulo\":\"Intro\",\"duracion\":83,\"track\":1}]",
     *           @OA\Schema(type="string")
     *         )
     *       )
     *     )
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Created",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="data", ref="#/components/schemas/Lanzamiento")
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function store(LanzamientoRequest $request)
    {
        $data = $request->validated();

        if (!isset($data['slug']) && isset($data['titulo'])) {
            $data['slug'] = Str::slug($data['titulo']);
        }

        unset($data['imagen']);

        $canciones = $request->input('canciones');

        if (is_string($canciones)) {
            $canciones = json_decode($canciones, true);
        }

        $canciones = is_array($canciones) ? $canciones : [];

        $lanzamiento = DB::transaction(function () use ($request, $data, $canciones) {
            $lanzamiento = Lanzamiento::create($data);

            if ($request->hasFile('imagen')) {
                $path = $request->file('imagen')->store('lanzamientos', 'public');
                $lanzamiento->imagen = basename($path);
                $lanzamiento->save();
            }

            if (!empty($canciones)) {
                foreach ($canciones as $c) {
                    $titulo = trim((string)($c['titulo'] ?? ''));
                    $duracion = (int)($c['duracion'] ?? 0);
                    $track = (int)($c['track'] ?? 0);

                    if ($titulo === '' || $duracion <= 0) {
                        continue;
                    }

                    $lanzamiento->canciones()->create([
                        'titulo' => $titulo,
                        'duracion' => $duracion,
                        'track_number' => $track > 0 ? $track : null,
                    ]);
                }
            }

            return $lanzamiento;
        });

        $lanzamiento->load(['canciones' => fn($q) => $q->orderBy('track_number')]);

        return (new LanzamientoResource($lanzamiento))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * @OA\Post(
     *   path="/api/lanzamientos/{id}",
     *   operationId="lanzamientosUpdate",
     *   summary="Actualizar lanzamiento (admin)",
     *   tags={"Lanzamientos"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         type="object",
     *         @OA\Property(property="_method", type="string", example="PUT"),
     *         @OA\Property(property="titulo", type="string"),
     *         @OA\Property(property="tipo", type="string", nullable=true),
     *         @OA\Property(property="fecha_lanzamiento", type="string", format="date", nullable=true),
     *         @OA\Property(property="descripcion", type="string", nullable=true),
     *         @OA\Property(property="compra_url", type="string", nullable=true),
     *         @OA\Property(property="audio_url", type="string", nullable=true),
     *         @OA\Property(property="video_url", type="string", nullable=true),
     *         @OA\Property(property="imagen", type="string", format="binary", nullable=true),
     *         @OA\Property(
     *           property="canciones",
     *           description="JSON string. Si trae id: actualiza. Si no trae id: crea. Las existentes no enviadas: se eliminan.",
     *           @OA\Schema(type="string")
     *         )
     *       )
     *     )
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="data", ref="#/components/schemas/Lanzamiento")
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not Found"),
     *   @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function update(LanzamientoRequest $request, int $id)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        $data = $request->validated();

        if (isset($data['titulo']) && $data['titulo'] !== $lanzamiento->titulo) {
            $data['slug'] = Str::slug($data['titulo']);
        } else {
            unset($data['slug']);
        }

        unset($data['imagen']);

        $canciones = $request->input('canciones');

        if (is_string($canciones)) {
            $canciones = json_decode($canciones, true);
        }

        $canciones = is_array($canciones) ? $canciones : [];

        $lanzamiento = DB::transaction(function () use ($request, $lanzamiento, $data, $canciones) {
            $lanzamiento->update($data);

            if ($request->hasFile('imagen')) {
                if (!empty($lanzamiento->imagen)) {
                    Storage::disk('public')->delete('lanzamientos/' . $lanzamiento->imagen);
                }

                $path = $request->file('imagen')->store('lanzamientos', 'public');
                $lanzamiento->imagen = basename($path);
                $lanzamiento->save();
            }

            if ($canciones !== null) {
                $this->syncCanciones($lanzamiento, $canciones);
            }

            return $lanzamiento;
        });

        $lanzamiento->load(['canciones' => fn($q) => $q->orderBy('track_number')]);

        return new LanzamientoResource($lanzamiento);
    }

    /**
     * @OA\Delete(
     *   path="/api/lanzamientos/{id}",
     *   operationId="lanzamientosDestroy",
     *   summary="Eliminar lanzamiento (admin)",
     *   tags={"Lanzamientos"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(
     *     name="id",
     *     in="path",
     *     required=true,
     *     @OA\Schema(type="integer")
     *   ),
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(
     *       type="object",
     *       @OA\Property(property="message", type="string", example="OK")
     *     )
     *   ),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not Found")
     * )
     */
    public function destroy(int $id)
    {
        $lanzamiento = Lanzamiento::findOrFail($id);

        if (!empty($lanzamiento->imagen)) {
            Storage::disk('public')->delete('lanzamientos/' . $lanzamiento->imagen);
        }

        $lanzamiento->delete();

        return response()->json(['message' => 'OK']);
    }

    private function syncCanciones(Lanzamiento $lanzamiento, array $canciones): void
    {
        $existingIds = $lanzamiento->canciones()->pluck('id')->all();
        $keepIds = [];

        foreach ($canciones as $c) {
            if (!is_array($c)) {
                continue;
            }

            $titulo = trim((string)($c['titulo'] ?? ''));
            $duracion = (int)($c['duracion'] ?? 0);
            $track = (int)($c['track'] ?? 0);
            $id = $c['id'] ?? null;

            if ($titulo === '' || $duracion <= 0) {
                continue;
            }

            $payload = [
                'titulo' => $titulo,
                'duracion' => $duracion,
                'track_number' => $track > 0 ? $track : null,
            ];

            if ($id) {
                $song = $lanzamiento->canciones()->whereKey($id)->first();
                if ($song) {
                    $song->update($payload);
                    $keepIds[] = $song->id;
                }
            } else {
                $new = $lanzamiento->canciones()->create($payload);
                $keepIds[] = $new->id;
            }
        }

        $toDelete = array_diff($existingIds, $keepIds);
        if (!empty($toDelete)) {
            $lanzamiento->canciones()->whereIn('id', $toDelete)->delete();
        }
    }
}
