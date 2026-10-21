<?php

namespace Tests\Feature;

use App\Models\Concierto;
use App\Models\Galeria;
use App\Models\Lanzamiento;
use App\Models\Multimedia;
use Database\Seeders\DemoMediaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class DemoMediaSeederTest extends TestCase
{
    use RefreshDatabase;

    private string $source;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->source = storage_path('framework/testing/demo-source-'.Str::uuid());
        foreach (['DISCOS/EP', 'DISCOS/FORGOTTEN TIMES/MP3', 'FOTOS', 'BOLOS'] as $folder) {
            File::ensureDirectoryExists($this->source.'/'.$folder);
        }
        config(['demo.media_path' => $this->source]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->source);
        parent::tearDown();
    }

    public function test_local_assets_use_responsive_images_and_playable_audio_storage(): void
    {
        $this->populateSource();
        $original = hash_file('sha256', $this->source.'/DISCOS/EP/1. 45N60E.wav');

        $this->seed(DemoMediaSeeder::class);

        $this->assertDatabaseCount('lanzamientos', 2);
        $this->assertDatabaseCount('canciones', 3);
        $this->assertDatabaseCount('conciertos', 2);
        $this->assertDatabaseCount('galerias', 1);
        $this->assertDatabaseCount('multimedia', 9);
        $this->assertDatabaseHas('canciones', ['titulo' => '45N60E', 'duracion' => 131, 'track_number' => 1]);
        $this->assertDatabaseHas('canciones', ['titulo' => 'HERE I AM', 'duracion' => 307, 'track_number' => 2]);

        foreach (Multimedia::where('tipo', 'imagen')->get() as $image) {
            $this->assertSame('image/webp', $image->mime_type);
            $this->assertSame(['sm', 'md', 'lg'], array_keys($image->variants));
            foreach (['sm', 'md', 'lg'] as $size) {
                Storage::disk('public')->assertExists("{$image->directorio}/{$size}/{$image->archivo}");
            }
            $this->assertSame(480, $image->variants['sm']['width']);
            $this->assertSame(1000, $image->variants['lg']['width']);
        }

        foreach (Multimedia::where('tipo', 'audio')->get() as $audio) {
            Storage::disk('public')->assertExists("{$audio->directorio}/{$audio->archivo}");
        }
        $this->assertSame($original, hash_file('sha256', $this->source.'/DISCOS/EP/1. 45N60E.wav'));
        $this->assertGreaterThan(now()->toDateString(), Concierto::min('fecha'));
        $this->assertLessThan(now()->toDateString(), Lanzamiento::max('fecha_lanzamiento'));
        $gallery = Galeria::firstOrFail();
        $this->assertSame(2, $gallery->imagenes()->count());
        $this->assertTrue($gallery->imagenes()->whereKey($gallery->portada_id)->exists());

        $song = Lanzamiento::where('tipo', 'EP')->firstOrFail()->canciones()->firstOrFail();
        $this->get("/api/canciones/{$song->id}/audio")->assertOk();
    }

    public function test_reseeding_is_idempotent_and_preserves_existing_content(): void
    {
        $this->populateSource();
        Lanzamiento::create(['titulo' => 'Contenido existente', 'tipo' => 'single']);
        $this->seed(DemoMediaSeeder::class);
        $release = Lanzamiento::where('tipo', 'album')->firstOrFail();
        $release->update(['descripcion' => 'Editado a mano']);
        $files = Storage::disk('public')->allFiles();

        $this->seed(DemoMediaSeeder::class);

        $this->assertDatabaseCount('lanzamientos', 3);
        $this->assertDatabaseCount('canciones', 3);
        $this->assertDatabaseCount('multimedia', 9);
        $this->assertDatabaseCount('conciertos', 2);
        $this->assertDatabaseCount('galerias', 1);
        $this->assertSame($files, Storage::disk('public')->allFiles());
        $this->assertSame('Editado a mano', $release->fresh()->descripcion);
        $this->assertDatabaseHas('lanzamientos', ['titulo' => 'Contenido existente']);
    }

    public function test_missing_source_fails_without_creating_content(): void
    {
        config(['demo.media_path' => $this->source.'/missing']);
        try {
            $this->seed(DemoMediaSeeder::class);
            $this->fail('A missing source must fail.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('DEMO_MEDIA_PATH', $exception->getMessage());
        }
        $this->assertDatabaseCount('lanzamientos', 0);
        $this->assertDatabaseCount('multimedia', 0);
    }

    public function test_legacy_concert_names_are_updated_without_duplicates_or_media_changes(): void
    {
        $this->populateSource();
        $this->seed(DemoMediaSeeder::class);
        $concert = Concierto::where('lugar', 'El Purgatorio')->firstOrFail();
        $posterId = $concert->cartel_id;
        $date = $concert->fecha;
        $files = Storage::disk('public')->allFiles();
        $legacyName = 'Concierto de prueba · cartel01.jpg · '.substr(sha1('cartel01.jpg'), 0, 8);
        $concert->update(['lugar' => $legacyName]);
        $unrelated = Concierto::create([
            'lugar' => 'El Purgatorio',
            'fecha' => '2026-12-20',
            'municipio' => 'Torrelavega',
            'provincia' => 'Cantabria',
            'descripcion' => 'Contenido ajeno al seeder',
        ]);

        $this->seed(DemoMediaSeeder::class);

        $this->assertDatabaseCount('conciertos', 3);
        $this->assertSame('El Purgatorio', $concert->fresh()->lugar);
        $this->assertSame($posterId, $concert->fresh()->cartel_id);
        $this->assertSame($date, $concert->fresh()->fecha);
        $this->assertSame($files, Storage::disk('public')->allFiles());
        $this->assertSame('Contenido ajeno al seeder', $unrelated->fresh()->descripcion);
        $this->assertDatabaseHas('conciertos', ['lugar' => 'Sala Rock']);
    }

    public function test_production_is_rejected_before_importing(): void
    {
        $this->app['env'] = 'production';
        try {
            $this->app->call([new DemoMediaSeeder, 'run']);
            $this->fail('Production must reject demo imports.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('local o testing', $exception->getMessage());
        }
        $this->assertDatabaseCount('lanzamientos', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_missing_audio_is_skipped_and_can_be_added_on_a_later_run(): void
    {
        $this->image('DISCOS/EP/PORTADA_01.jpg');
        $this->seed(DemoMediaSeeder::class);
        $this->assertDatabaseCount('canciones', 0);
        $this->audio('DISCOS/EP/1. 45N60E.wav');
        $this->seed(DemoMediaSeeder::class);
        $this->assertDatabaseCount('canciones', 1);
        $this->assertSame(1, Multimedia::where('tipo', 'audio')->count());
    }

    private function populateSource(): void
    {
        foreach ([
            'DISCOS/EP/PORTADA_01.jpg',
            'DISCOS/FORGOTTEN TIMES/MP3/PORTADA.png',
            'FOTOS/banda01.jpg',
            'FOTOS/banda02.jpg',
            'BOLOS/cartel01.jpg',
            'BOLOS/cartel02.jpg',
        ] as $path) {
            $this->image($path);
        }
        foreach ([
            'DISCOS/EP/1. 45N60E.wav',
            'DISCOS/FORGOTTEN TIMES/MP3/01. INTRO.mp3',
            'DISCOS/FORGOTTEN TIMES/MP3/02. HERE I AM.mp3',
        ] as $path) {
            $this->audio($path);
        }
    }

    private function image(string $path): void
    {
        $image = UploadedFile::fake()->image(basename($path), 1000, 600);
        File::copy($image->getPathname(), $this->source.'/'.$path);
    }

    private function audio(string $path): void
    {
        $audio = UploadedFile::fake()->create(basename($path), 1);
        File::copy($audio->getPathname(), $this->source.'/'.$path);
    }
}
