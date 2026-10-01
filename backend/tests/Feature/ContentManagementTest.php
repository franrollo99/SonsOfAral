<?php

namespace Tests\Feature;

use App\Models\Concierto;
use App\Models\Multimedia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_administrator_can_create_a_concert(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/conciertos', [
                'fecha' => '2026-12-12',
                'provincia' => 'Cantabria',
                'municipio' => 'Torrelavega',
                'lugar' => 'Sala Example',
                'entrada_anticipada' => false,
                'enlace_entrada_anticipada' => 'https://example.test/entrada',
            ])
            ->assertCreated()
            ->assertJsonPath('data.lugar', 'Sala Example')
            ->assertJsonPath('data.entradaAnticipada', false)
            ->assertJsonPath('data.enlaceEntradaAnticipada', null);

        $this->assertDatabaseHas('conciertos', [
            'lugar' => 'Sala Example',
            'entrada_anticipada' => false,
            'enlace_entrada_anticipada' => null,
        ]);
    }

    public function test_an_administrator_can_create_a_release_with_its_songs(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/lanzamientos', [
                'tipo' => 'album',
                'titulo' => 'Prueba de lanzamiento',
                'canciones' => [
                    ['track' => 1, 'titulo' => 'Primera canción', 'duracion' => 180],
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Prueba de lanzamiento')
            ->assertJsonPath('data.canciones.0.titulo', 'Primera canción');

        $this->assertDatabaseHas('lanzamientos', ['titulo' => 'Prueba de lanzamiento']);
        $this->assertDatabaseHas('canciones', ['titulo' => 'Primera canción', 'track_number' => 1]);
    }

    public function test_an_administrator_can_create_a_band_gallery(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/galerias', [
                'tipo' => 'banda',
                'titulo' => 'Ensayo',
            ])
            ->assertCreated()
            ->assertJsonPath('data.tipo', 'banda')
            ->assertJsonPath('data.titulo', 'Ensayo');

        $this->assertDatabaseHas('galerias', [
            'tipo' => 'banda',
            'titulo' => 'Ensayo',
            'concierto_id' => null,
        ]);
    }

    public function test_an_administrator_can_remove_a_concert_poster(): void
    {
        $admin = User::factory()->create(['rol' => 'admin']);
        $cartel = Multimedia::create([
            'directorio' => 'imagenes/conciertos',
            'archivo' => 'cartel-prueba.webp',
            'nombre_original' => 'cartel-prueba.jpg',
            'tipo' => 'imagen',
            'mime_type' => 'image/webp',
            'peso' => 100,
        ]);
        $concierto = Concierto::create([
            'fecha' => '2026-12-12',
            'provincia' => 'Cantabria',
            'municipio' => 'Torrelavega',
            'lugar' => 'Sala Example',
            'entrada_anticipada' => true,
            'cartel_id' => $cartel->id,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/conciertos/{$concierto->id}", [
                'fecha' => '2026-12-12',
                'provincia' => 'Cantabria',
                'municipio' => 'Torrelavega',
                'lugar' => 'Sala Example',
                'entrada_anticipada' => true,
                'remove_cartel' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.cartel', null);

        $this->assertDatabaseHas('conciertos', [
            'id' => $concierto->id,
            'cartel_id' => null,
        ]);
        $this->assertDatabaseMissing('multimedia', ['id' => $cartel->id]);
    }
}
