<?php

namespace Database\Seeders;

use App\Models\Concierto;
use App\Models\Galeria;
use App\Models\Lanzamiento;
use App\Services\MultimediaService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;

class DemoMediaSeeder extends Seeder
{
    private string $source;

    private MultimediaService $media;

    public function run(MultimediaService $media): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Los archivos de prueba solo se importan en local o testing.');
        }

        $source = config('demo.media_path');
        $resolved = is_string($source) && $source !== '' ? realpath($source) : false;

        if (! $resolved || ! is_dir($resolved)) {
            throw new RuntimeException('Configura DEMO_MEDIA_PATH con la carpeta original, no con el acceso directo.');
        }

        foreach (['DISCOS', 'BOLOS', 'FOTOS'] as $folder) {
            if (! is_dir($resolved.DIRECTORY_SEPARATOR.$folder)) {
                throw new RuntimeException("La carpeta de prueba no contiene {$folder}.");
            }
        }

        $this->source = $resolved;
        $this->media = $media;
        $this->seedReleases();
        $this->seedConcerts();
        $this->seedGallery();
        $this->command?->info('Archivos de prueba importados. Los originales y el administrador no se han modificado.');
    }

    private function seedReleases(): void
    {
        $fixtures = require __DIR__.'/fixtures/media.php';

        foreach ($fixtures as $fixture) {
            $directory = $this->source.'/'.$fixture['directory'];
            if (! is_dir($directory)) {
                $this->command?->warn("Se omite el lanzamiento sin carpeta: {$fixture['titulo']}");

                continue;
            }

            $release = Lanzamiento::firstOrCreate(
                ['titulo' => $fixture['titulo']],
                [
                    'tipo' => $fixture['tipo'],
                    'fecha_lanzamiento' => now()->subMonthsNoOverflow($fixture['months_ago'])->toDateString(),
                    'descripcion' => 'Contenido de prueba con archivos locales. La fecha no es la publicación oficial.',
                ]
            );
            $cover = $directory.'/'.$fixture['cover'];
            if (is_file($cover)) {
                $this->attachMedia($release, 'portada_id', $cover, 'imagenes/lanzamientos', 'imagen');
            }

            foreach ($fixture['durations'] as $filename => $duration) {
                $path = $directory.'/'.$filename;
                if (! is_file($path)) {
                    $this->command?->warn("Se omite el audio que falta: {$filename}");

                    continue;
                }

                if (! preg_match('/^(\d+)\.\s*(.+)$/u', pathinfo($filename, PATHINFO_FILENAME), $parts)) {
                    throw new RuntimeException("La pista no tiene un número válido: {$filename}");
                }
                $song = $release->canciones()->firstOrCreate(
                    ['track_number' => (int) $parts[1]],
                    ['titulo' => $parts[2], 'duracion' => $duration]
                );
                $this->attachMedia($song, 'audio_id', $path, 'audios/canciones', 'audio');
            }
            $this->command?->info("Lanzamiento: {$release->titulo}");
        }
    }

    private function seedConcerts(): void
    {
        $venues = [
            'El Purgatorio',
            'Sala Rock',
            'El Astillero',
            'La Fábrica',
            'Sala Búnker',
            'El Refugio',
            'La Trinchera',
            'Sala Horizonte',
            'El Sótano',
        ];
        $description = 'Evento ficticio para probar la web. El cartel original no corresponde a esta fecha.';

        foreach ($this->images('BOLOS') as $index => $file) {
            $name = Str::limit($file->getFilename(), 100, '');
            $identifier = substr(sha1($file->getFilename()), 0, 8);
            $venue = $venues[$index] ?? 'Sala de conciertos '.($index + 1);

            // Rename the earlier demo labels without replacing their posters or dates.
            $concert = Concierto::where('lugar', "Concierto de prueba · {$name} · {$identifier}")
                ->where('descripcion', $description)
                ->first();

            if ($concert) {
                $concert->update(['lugar' => $venue]);
            }

            $concert ??= Concierto::firstOrCreate(
                ['lugar' => $venue, 'descripcion' => $description],
                [
                    'fecha' => now()->addWeeks($index + 1)->toDateString(),
                    'provincia' => 'Cantabria',
                    'municipio' => 'Santander',
                    'precio_entrada' => 0,
                    'entrada_anticipada' => false,
                ]
            );
            $this->attachMedia($concert, 'cartel_id', $file->getPathname(), 'imagenes/conciertos', 'imagen');
        }
        $this->command?->info('Conciertos de prueba con carteles preparados.');
    }

    private function seedGallery(): void
    {
        $files = $this->images('FOTOS');
        if ($files === []) {
            return;
        }

        $gallery = Galeria::firstOrCreate(
            ['titulo' => 'Fotos de la banda · prueba', 'tipo' => 'banda'],
            ['concierto_id' => null]
        );

        foreach ($files as $file) {
            $image = $gallery->imagenes()->where('nombre_original', $file->getFilename())->first();
            if (! $image) {
                $image = $this->media->storeImage(
                    $this->upload($file->getPathname()),
                    'imagenes/galerias',
                    ['galeria_id' => $gallery->id]
                );
            }

            // Reuse a gallery image for its cover instead of copying it twice.
            if (! $gallery->portada_id) {
                $gallery->update(['portada_id' => $image->id]);
            }
        }
        $this->command?->info('Galería de la banda preparada.');
    }

    private function attachMedia(Model $owner, string $column, string $path, string $directory, string $type): void
    {
        if ($owner->getAttribute($column)) {
            return;
        }

        $upload = $this->upload($path);
        $media = $type === 'imagen'
            ? $this->media->storeImage($upload, $directory)
            : $this->media->storeFile($upload, $directory, $type);

        try {
            $owner->update([$column => $media->id]);
        } catch (\Throwable $failure) {
            $this->media->delete($media);
            throw $failure;
        }
    }

    private function upload(string $path): UploadedFile
    {
        $resolved = realpath($path);
        $prefix = $this->source.DIRECTORY_SEPARATOR;
        if (! $resolved || ! str_starts_with($resolved, $prefix)) {
            throw new RuntimeException('Un archivo de prueba apunta fuera de la carpeta configurada.');
        }

        return new UploadedFile($resolved, basename($resolved), test: true);
    }

    private function images(string $folder): array
    {
        $files = array_filter(
            File::files($this->source.'/'.$folder),
            fn ($file) => in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp'], true)
        );
        usort($files, fn ($a, $b) => strnatcasecmp($a->getFilename(), $b->getFilename()));

        return $files;
    }
}
