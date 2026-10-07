<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;

class ImageService
{
    public const PHOTO_WIDTHS = ['sm' => 480, 'md' => 960, 'lg' => 1920];

    public const LOGO_WIDTHS = ['sm' => 96, 'md' => 192, 'lg' => 384];

    public function storeResponsiveImage(UploadedFile $file, string $directorio, string $profile = 'photo'): array
    {
        $logo = $profile === 'logo';
        $extension = $logo ? 'png' : 'webp';
        $filename = pathinfo($file->hashName(), PATHINFO_FILENAME).'.'.$extension;
        $driver = extension_loaded('imagick')
            ? new \Intervention\Image\Drivers\Imagick\Driver
            : new \Intervention\Image\Drivers\Gd\Driver;
        $manager = new ImageManager($driver);
        $widths = $logo ? self::LOGO_WIDTHS : self::PHOTO_WIDTHS;
        $variants = [];
        $written = [];

        try {
            foreach ($widths as $size => $width) {
                $image = $manager->read($file->getPathname())->scaleDown(width: $width);
                $encoded = (string) ($logo ? $image->toPng() : $image->toWebp(80));
                $path = "{$directorio}/{$size}/{$filename}";
                $written[] = $path;
                if (! Storage::disk('public')->put($path, $encoded)) {
                    throw new \RuntimeException('No se pudo guardar la imagen.');
                }
                $variants[$size] = ['width' => $image->width(), 'height' => $image->height(), 'bytes' => strlen($encoded)];
            }
        } catch (\Throwable $failure) {
            Storage::disk('public')->delete($written);
            throw $failure;
        }

        return [
            'directorio' => $directorio,
            'archivo' => $filename,
            'nombre_original' => $file->getClientOriginalName(),
            'mime_type' => $logo ? 'image/png' : 'image/webp',
            'peso' => $variants['lg']['bytes'],
            'variants' => $variants,
        ];
    }

    public function deleteResponsiveImage(?string $directorio, ?string $archivo): void
    {
        if (! $directorio || ! $archivo) {
            return;
        }
        foreach (['sm', 'md', 'lg'] as $size) {
            Storage::disk('public')->delete("{$directorio}/{$size}/{$archivo}");
        }
    }
}
