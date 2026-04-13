<?php

namespace App\Services;

use App\Models\Lanzamiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LanzamientoService
{
    public function __construct(
        protected MultimediaService $multimediaService
    ) {
    }

    public function create(array $data, Request $request): Lanzamiento
    {
        if (!isset($data['slug']) && isset($data['titulo'])) {
            $data['slug'] = Str::slug($data['titulo']);
        }

        unset($data['portada']);

        $canciones = $this->parseCanciones($request->input('canciones'));

        $lanzamiento = DB::transaction(function () use ($data, $request, $canciones) {
            $lanzamiento = Lanzamiento::create($data);

            if ($request->hasFile('portada')) {
                $media = $this->multimediaService->storeImage(
                    $request->file('portada'),
                    'imagenes/lanzamientos'
                );

                $lanzamiento->portada_id = $media->id;
                $lanzamiento->save();
            }

            if (!empty($canciones)) {
                $this->syncCanciones($lanzamiento, $canciones, $request);
            }

            return $lanzamiento;
        });

        return $lanzamiento->load([
            'canciones' => fn($q) => $q->with('audio')->orderBy('track_number'),
        ]);
    }

    public function update(Lanzamiento $lanzamiento, array $data, Request $request): Lanzamiento
    {
        if (isset($data['titulo']) && $data['titulo'] !== $lanzamiento->titulo) {
            $data['slug'] = Str::slug($data['titulo']);
        } else {
            unset($data['slug']);
        }

        unset($data['portada']);

        $canciones = $this->parseCanciones($request->input('canciones'));

        $lanzamiento = DB::transaction(function () use ($lanzamiento, $data, $request, $canciones) {
            $lanzamiento->update($data);

            if ($request->boolean('remove_portada')) {
                $this->multimediaService->delete($lanzamiento->portada);
                $lanzamiento->portada_id = null;
                $lanzamiento->save();
            }

            if ($request->hasFile('portada')) {
                $media = $this->multimediaService->replaceImage(
                    $lanzamiento->portada,
                    $request->file('portada'),
                    'imagenes/lanzamientos'
                );

                $lanzamiento->portada_id = $media->id;
                $lanzamiento->save();
            }

            $this->syncCanciones($lanzamiento, $canciones, $request);

            return $lanzamiento;
        });

        return $lanzamiento->load([
            'canciones' => fn($q) => $q->with('audio')->orderBy('track_number'),
        ]);
    }

    public function delete(Lanzamiento $lanzamiento): void
    {
        DB::transaction(function () use ($lanzamiento) {
            $lanzamiento->load(['portada', 'canciones.audio']);

            $this->multimediaService->delete($lanzamiento->portada);

            foreach ($lanzamiento->canciones as $cancion) {
                $this->multimediaService->delete($cancion->audio);
            }

            $lanzamiento->delete();
        });
    }

    protected function parseCanciones(mixed $canciones): array
    {
        if (is_string($canciones)) {
            $canciones = json_decode($canciones, true);
        }

        return is_array($canciones) ? $canciones : [];
    }

    protected function syncCanciones(Lanzamiento $lanzamiento, array $canciones, Request $request): void
    {
        $existingSongs = $lanzamiento->canciones()->with('audio')->get()->keyBy('id');
        $keepIds = [];

        foreach ($canciones as $c) {
            if (!is_array($c)) {
                continue;
            }

            $titulo = trim((string) ($c['titulo'] ?? ''));
            $duracion = (int) ($c['duracion'] ?? 0);
            $track = (int) ($c['track'] ?? 0);
            $id = $c['id'] ?? null;
            $audioKey = $c['audio_key'] ?? null;
            $removeAudio = (int) ($c['remove_audio'] ?? 0) === 1;

            if ($titulo === '' || $duracion <= 0) {
                continue;
            }

            $payload = [
                'titulo' => $titulo,
                'duracion' => $duracion,
                'track_number' => $track > 0 ? $track : null,
            ];

            if ($id) {
                $song = $lanzamiento->canciones()->with('audio')->whereKey($id)->first();

                if (!$song) {
                    continue;
                }

                $song->update($payload);

                if ($removeAudio) {
                    $this->multimediaService->delete($song->audio);
                    $song->audio_id = null;
                    $song->save();
                }

                if ($audioKey && $request->hasFile($audioKey)) {
                    $media = $this->multimediaService->replaceFile(
                        $song->audio,
                        $request->file($audioKey),
                        'audios/canciones',
                        'audio'
                    );

                    $song->audio_id = $media->id;
                    $song->save();
                }

                $keepIds[] = $song->id;
                continue;
            }

            $song = $lanzamiento->canciones()->create($payload);

            if ($audioKey && $request->hasFile($audioKey)) {
                $media = $this->multimediaService->storeFile(
                    $request->file($audioKey),
                    'audios/canciones',
                    'audio'
                );

                $song->audio_id = $media->id;
                $song->save();
            }

            $keepIds[] = $song->id;
        }

        $toDelete = array_diff($existingSongs->keys()->all(), $keepIds);

        if (!empty($toDelete)) {
            $songsToDelete = $lanzamiento->canciones()->with('audio')->whereIn('id', $toDelete)->get();

            foreach ($songsToDelete as $song) {
                $this->multimediaService->delete($song->audio);
                $song->delete();
            }
        }
    }
}