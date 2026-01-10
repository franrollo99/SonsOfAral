<?php

namespace Database\Seeders;

use App\Models\Lanzamiento;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Producto;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(3)->create();

        $this->call(UserSeeder::class);
        $this->call(LanzamientoSeeder::class);
        $this->call(ConciertoSeeder::class);
        $this->call(TiposProductoSeeder::class);
        $this->call(ProductosSeeder::class);

    }
}
