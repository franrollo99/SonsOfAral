<?php

namespace App\Services;

use App\Models\Multimedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MultimediaService
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    public function storeImage(
        UploadedFile $file,
        string $directorio,
        array $extra = []
    ): Multimedia {
        $imageData = $this->imageService->storeResponsiveImage($file, $directorio);

        return Multimedia::create([
            'directorio' => $imageData['directorio'],
            'archivo' => $imageData['archivo'],
            'nombre_original' => $imageData['nombre_original'],
            'tipo' => 'imagen',
            'mime_type' => $imageData['mime_type'],
            'peso' => $imageData['peso'],
            ...$extra,
        ]);
    }

    public function replaceImage(
        ?Multimedia $oldMedia,
        UploadedFile $file,
        string $directorio,
        array $extra = []
    ): Multimedia {
        if ($oldMedia) {
            $this->delete($oldMedia);
        }

        return $this->storeImage($file, $directorio, $extra);
    }

    public function storeFile(
        UploadedFile $file,
        string $directorio,
        string $tipo,
        array $extra = []
    ): Multimedia {
        $path = $file->store($directorio, 'public');

        return Multimedia::create([
            'directorio' => dirname($path) === '.' ? null : dirname($path),
            'archivo' => basename($path),
            'nombre_original' => $file->getClientOriginalName(),
            'tipo' => $tipo,
            'mime_type' => $file->getMimeType(),
            'peso' => $file->getSize(),
            ...$extra,
        ]);
    }

    public function replaceFile(
        ?Multimedia $oldMedia,
        UploadedFile $file,
        string $directorio,
        string $tipo,
        array $extra = []
    ): Multimedia {
        if ($oldMedia) {
            $this->delete($oldMedia);
        }

        return $this->storeFile($file, $directorio, $tipo, $extra);
    }

    public function delete(?Multimedia $media): void
    {
        if (! $media) {
            return;
        }

        $tipo = $media->tipo;
        $directorio = $media->directorio;
        $archivo = $media->archivo;
        $media->delete();

        DB::afterCommit(function () use ($tipo, $directorio, $archivo) {
            if ($tipo === 'imagen') {
                $this->imageService->deleteResponsiveImage($directorio, $archivo);

                return;
            }

            $path = $this->buildPath($directorio, $archivo);

            if ($path) {
                Storage::disk('public')->delete($path);
            }
        });
    }

    protected function buildPath(?string $directorio, ?string $archivo): ?string
    {
        if (! $archivo) {
            return null;
        }

        return $directorio ? "{$directorio}/{$archivo}" : $archivo;
    }
}
