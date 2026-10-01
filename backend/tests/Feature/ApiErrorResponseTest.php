<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class ApiErrorResponseTest extends TestCase
{
    public function test_unknown_api_route_uses_the_standard_not_found_response(): void
    {
        $this->getJson('/api/no-existe')
            ->assertNotFound()
            ->assertExactJson([
                'message' => 'El recurso solicitado no existe.',
                'code' => 'NOT_FOUND',
            ]);
    }

    public function test_gallery_writes_require_authentication(): void
    {
        $this->postJson('/api/galerias', [])
            ->assertUnauthorized()
            ->assertExactJson([
                'message' => 'Debes iniciar sesión para realizar esta acción.',
                'code' => 'UNAUTHENTICATED',
            ]);
    }

    public function test_gallery_writes_require_an_administrator(): void
    {
        $this->actingAs(new User(['rol' => 'cliente']), 'sanctum')
            ->postJson('/api/galerias', [])
            ->assertForbidden()
            ->assertJsonPath('code', 'FORBIDDEN');
    }

    public function test_gallery_validation_uses_the_standard_error_contract(): void
    {
        $this->actingAs(new User(['rol' => 'admin']), 'sanctum')
            ->postJson('/api/galerias', [])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'VALIDATION_ERROR')
            ->assertJsonStructure(['message', 'code', 'errors' => ['tipo']]);
    }
}
