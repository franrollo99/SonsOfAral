<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'nombre' => 'Francisco',
            'apellidos' => 'Rodríguez',
            'email' => 'admin@sonsofaral.com',
            'rol' => 'admin',
            'password' => bcrypt('admin123'),
        ]);

        User::factory()->create([
            'nombre' => 'Laura',
            'apellidos' => 'Martínez',
            'email' => 'cliente@sonsofaral.com',
            'rol' => 'cliente',
            'password' => bcrypt('cliente123'),
        ]);
    }
}
