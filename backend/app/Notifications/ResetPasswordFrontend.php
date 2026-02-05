<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordFrontend extends Notification
{
    use Queueable;

    public function __construct(
        public string $token,
        public string $email
    ) {}

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        $url = $frontendUrl
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($this->email);

        return (new MailMessage)
            ->subject('Restablecer contraseña')
            ->line('Has solicitado restablecer tu contraseña.')
            ->action('Cambiar contraseña', $url)
            ->line('Si no solicitaste este cambio, ignora este correo.');
    }
}
