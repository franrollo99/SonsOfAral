<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ResetPasswordFrontend;
use Tests\TestCase;

class FrontendConfigurationTest extends TestCase
{
    public function test_password_reset_uses_cached_frontend_configuration(): void
    {
        config(['site.frontend_url' => 'https://example.com/']);

        $notification = new ResetPasswordFrontend('test-token', 'admin@example.com');
        $message = $notification->toMail(new User);

        $this->assertSame(
            'https://example.com/gestion/recuperar?token=test-token&email=admin%40example.com',
            $message->actionUrl
        );
    }
}
