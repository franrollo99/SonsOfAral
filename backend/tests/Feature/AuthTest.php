<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_log_in_and_receive_a_token(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.test',
            'password' => 'Password1!',
            'rol' => 'admin',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'admin@example.test')
            ->assertJsonPath('data.user.rol', 'admin')
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_invalid_credentials_use_a_machine_readable_error_code(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'missing@example.test',
            'password' => 'Password1!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('code', 'INVALID_CREDENTIALS');
    }

    public function test_non_administrator_cannot_start_a_management_session(): void
    {
        $user = User::factory()->create([
            'email' => 'visitor@example.test',
            'password' => 'Password1!',
            'rol' => 'cliente',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'Password1!',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('code', 'INVALID_CREDENTIALS');
    }
}
