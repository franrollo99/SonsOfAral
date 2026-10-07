<?php

namespace Tests\Feature;

use App\Models\SiteImage;
use App\Models\User;
use App\Services\ImageService;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SiteImageTest extends TestCase
{
    use DatabaseMigrations;

    public function test_defaults_are_public_but_changes_require_an_administrator(): void
    {
        $this->getJson('/api/contenido-web')->assertOk()->assertJsonPath('data.home.custom', false);
        $this->putJson('/api/contenido-web/home', ['alt' => 'Foto'])->assertUnauthorized();
        $user = User::factory()->create(['rol' => 'cliente']);
        $this->actingAs($user, 'sanctum')->putJson('/api/contenido-web/logo', ['alt' => 'Logo'])->assertForbidden();
    }

    public function test_upload_replacement_validation_and_reset_preserve_the_correct_files(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['rol' => 'admin']);
        $this->actingAs($admin, 'sanctum')->post('/api/contenido-web/home', [
            '_method' => 'PUT', 'alt' => 'Foto de banda', 'image' => UploadedFile::fake()->image('banda.png', 1200, 800),
        ])->assertOk()->assertJsonPath('data.custom', true)->assertJsonPath('data.variants.1.width', 960);
        $old = SiteImage::first()->multimedia;
        $this->assertSame(1200, $old->variants['lg']['width']);
        $this->assertSame('image/webp', $old->mime_type);
        Storage::disk('public')->assertExists("{$old->directorio}/lg/{$old->archivo}");

        $this->putJson('/api/contenido-web/home', ['alt' => ''])->assertUnprocessable();
        $this->assertSame($old->id, SiteImage::first()->multimedia_id);
        Storage::disk('public')->assertExists("{$old->directorio}/lg/{$old->archivo}");

        $this->post('/api/contenido-web/home', [
            '_method' => 'PUT', 'alt' => 'Otra foto', 'image' => UploadedFile::fake()->image('otra.png', 600, 400),
        ])->assertOk();
        $this->assertDatabaseMissing('multimedia', ['id' => $old->id]);
        foreach (['sm', 'md', 'lg'] as $size) {
            Storage::disk('public')->assertMissing("{$old->directorio}/{$size}/{$old->archivo}");
        }
        $this->putJson('/api/contenido-web/home', ['alt' => 'Sons of Aral', 'reset' => true])
            ->assertOk()->assertJsonPath('data.custom', false);
        $this->assertDatabaseCount('multimedia', 0);
        $this->putJson('/api/contenido-web/unknown', ['alt' => 'Test'])->assertNotFound();
    }

    public function test_logo_is_lossless_png_with_transparency_and_small_images_are_not_upscaled(): void
    {
        Storage::fake('public');
        $canvas = imagecreatetruecolor(100, 80);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        ob_start();
        imagepng($canvas);
        $contents = ob_get_clean();
        imagedestroy($canvas);
        $file = UploadedFile::fake()->createWithContent('logo.png', $contents);
        $data = app(ImageService::class)->storeResponsiveImage($file, 'imagenes/web/logo', 'logo');
        $this->assertSame('image/png', $data['mime_type']);
        $this->assertSame(100, $data['variants']['lg']['width']);
        $encoded = Storage::disk('public')->get("{$data['directorio']}/lg/{$data['archivo']}");
        $image = imagecreatefromstring($encoded);
        $this->assertSame(127, imagecolorsforindex($image, imagecolorat($image, 0, 0))['alpha']);
        imagedestroy($image);
    }

    public function test_svg_and_oversized_uploads_are_rejected(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $this->actingAs($admin, 'sanctum')->postJson('/api/contenido-web/logo', [
            '_method' => 'PUT', 'alt' => 'Logo', 'image' => UploadedFile::fake()->createWithContent('logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');
        $this->postJson('/api/contenido-web/home', [
            '_method' => 'PUT', 'alt' => 'Foto', 'image' => UploadedFile::fake()->image('foto.jpg')->size(5121),
        ])->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    public function test_failed_processing_does_not_remove_the_current_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['rol' => 'admin']);
        $this->actingAs($admin, 'sanctum')->post('/api/contenido-web/home', [
            '_method' => 'PUT', 'alt' => 'Foto actual', 'image' => UploadedFile::fake()->image('actual.png'),
        ])->assertOk();
        $old = SiteImage::first()->multimedia;
        $this->mock(ImageService::class, function ($mock) {
            $mock->shouldReceive('storeResponsiveImage')->once()->andThrow(new \RuntimeException('Processing failed'));
        });
        $this->postJson('/api/contenido-web/home', [
            '_method' => 'PUT', 'alt' => 'Nueva foto', 'image' => UploadedFile::fake()->image('nueva.png'),
        ])->assertStatus(500);
        $this->assertSame($old->id, SiteImage::first()->multimedia_id);
        Storage::disk('public')->assertExists("{$old->directorio}/lg/{$old->archivo}");
    }
}
