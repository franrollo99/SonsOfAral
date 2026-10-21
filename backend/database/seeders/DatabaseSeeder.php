<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        if (config('demo.media_path')) {
            $this->call(DemoMediaSeeder::class);

            return;
        }

        $this->call(LanzamientoSeeder::class);
        $this->call(ConciertoSeeder::class);
    }
}
