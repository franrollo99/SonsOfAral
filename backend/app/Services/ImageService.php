<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ImageService
{
    public function storeResponsiveImage(
        UploadedFile $file,
        string $directorio
    ): array {
        $nombreBase = pathinfo($file->hashName(), PATHINFO_FILENAME);
        $nombreWebp = $nombreBase . '.webp';

        $driver = extension_loaded('imagick')
            ? new \Intervention\Image\Drivers\Imagick\Driver()
            : new \Intervention\Image\Drivers\Gd\Driver();

        $manager = new ImageManager($driver);

        $variantes = [
            'sm' => ['width' => 500, 'quality' => 80],
            'lg' => ['width' => 1400, 'quality' => 80],
        ];

        foreach ($variantes as $key => $config) {
            $img = $manager->read($file->getPathname());
            $img->scaleDown(width: $config['width']);

            $encoded = $img->toWebp($config['quality']);

            $path = "{$directorio}/{$key}/{$nombreWebp}";

            Storage::disk('public')->put($path, (string) $encoded);
        }

        return [
            'directorio' => $directorio,
            'archivo' => $nombreWebp,
            'nombre_original' => $file->getClientOriginalName(),
            'mime_type' => 'image/webp',
            'peso' => $file->getSize(),
        ];
    }

    public function deleteResponsiveImage(?string $directorio, ?string $archivo): void
    {
        if (!$directorio || !$archivo) return;

        foreach (['sm', 'lg'] as $size) {
            Storage::disk('public')->delete("{$directorio}/{$size}/{$archivo}");
        }
    }
}
