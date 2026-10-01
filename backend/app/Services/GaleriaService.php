<?php

namespace App\Services;

use App\Models\Galeria;
use App\Models\Multimedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class GaleriaService
{
    public function __construct(
        protected MultimediaService $multimediaService
    ) {}

    public function create(array $data, ?UploadedFile $portada, array $imagenes): Galeria
    {
        $galeria = DB::transaction(function () use ($data, $portada, $imagenes) {
            $galeria = Galeria::create($this->galleryData($data));

            $this->storeCover($galeria, $portada);
            $this->storeImages($galeria, $imagenes);

            return $galeria;
        });

        return $galeria->load(['concierto', 'portada', 'imagenes']);
    }

    public function update(
        Galeria $galeria,
        array $data,
        ?UploadedFile $portada,
        array $imagenes
    ): Galeria {
        DB::transaction(function () use ($galeria, $data, $portada, $imagenes) {
            $galeria->loadMissing(['portada', 'imagenes']);
            $galeria->update($this->galleryData($data));

            if ($data['remove_portada'] ?? false) {
                $this->removeCover($galeria);
            }

            $this->storeCover($galeria, $portada);
            $this->removeImages($galeria, $data['remove_imagen_ids'] ?? []);
            $this->storeImages($galeria, $imagenes);
        });

        return $galeria->load(['concierto', 'portada', 'imagenes']);
    }

    public function delete(Galeria $galeria): void
    {
        DB::transaction(function () use ($galeria) {
            $galeria->loadMissing(['portada', 'imagenes']);

            $media = $galeria->imagenes->prepend($galeria->portada)->filter()->unique('id');

            foreach ($media as $item) {
                $this->multimediaService->delete($item);
            }

            $galeria->delete();
        });
    }

    private function galleryData(array $data): array
    {
        $data = Arr::only($data, ['tipo', 'titulo', 'concierto_id']);

        if (($data['tipo'] ?? null) === 'banda') {
            $data['concierto_id'] = null;
        }

        return $data;
    }

    private function storeCover(Galeria $galeria, ?UploadedFile $portada): void
    {
        if (! $portada) {
            return;
        }

        $media = $this->multimediaService->replaceImage(
            $galeria->portada,
            $portada,
            'imagenes/galerias',
            ['galeria_id' => $galeria->id]
        );

        $galeria->portada_id = $media->id;
        $galeria->save();
        $galeria->setRelation('portada', $media);
    }

    private function removeCover(Galeria $galeria): void
    {
        $this->multimediaService->delete($galeria->portada);
        $galeria->portada_id = null;
        $galeria->save();
        $galeria->unsetRelation('portada');
    }

    private function storeImages(Galeria $galeria, array $imagenes): void
    {
        foreach ($imagenes as $imagen) {
            if (! $imagen instanceof UploadedFile) {
                continue;
            }

            $this->multimediaService->storeImage(
                $imagen,
                'imagenes/galerias',
                ['galeria_id' => $galeria->id]
            );
        }
    }

    private function removeImages(Galeria $galeria, array $ids): void
    {
        $ids = array_unique(array_map('intval', $ids));

        if ($ids === []) {
            return;
        }

        $imagenes = Multimedia::query()
            ->where('galeria_id', $galeria->id)
            ->whereIn('id', $ids)
            ->get();

        foreach ($imagenes as $imagen) {
            if ((int) $galeria->portada_id === (int) $imagen->id) {
                $galeria->portada_id = null;
                $galeria->unsetRelation('portada');
            }

            $this->multimediaService->delete($imagen);
        }

        $galeria->save();
    }
}
