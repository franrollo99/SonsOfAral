<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@sonsofaral.com'],
            [
                'nombre' => 'Francisco',
                'apellidos' => 'Rodríguez',
                'rol' => 'admin',
                'password' => bcrypt('admin123'),
                'email_verified_at' => now(),
            ]
        );
    }
}
