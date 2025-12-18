<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LanzamientoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $album1Id = DB::table('lanzamientos')->insertGetId([
            'titulo' => 'Echoes of the Void',
            'tipo' => 'Album',
            'fecha_lanzamiento' => '2022-05-20',
            'descripcion' => 'Un álbum que mezcla groove metal con matices progresivos.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            ['lanzamiento_id' => $album1Id, 'titulo' => 'Into the Abyss', 'duracion' => 242, 'track_number' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album1Id, 'titulo' => 'Burn the Silence', 'duracion' => 198, 'track_number' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album1Id, 'titulo' => 'Crimson Horizon', 'duracion' => 256, 'track_number' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album1Id, 'titulo' => 'Chains of Tomorrow', 'duracion' => 233, 'track_number' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album1Id, 'titulo' => 'Fractured Light', 'duracion' => 211, 'track_number' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Álbum 2
        $album2Id = DB::table('lanzamientos')->insertGetId([
            'titulo' => 'Ashes and Rebirth',
            'tipo' => 'Album',
            'fecha_lanzamiento' => '2024-03-08',
            'descripcion' => 'Una nueva etapa con sonidos más melódicos y oscuros.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            ['lanzamiento_id' => $album2Id, 'titulo' => 'Rise Again', 'duracion' => 221, 'track_number' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album2Id, 'titulo' => 'The Last Flame', 'duracion' => 247, 'track_number' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album2Id, 'titulo' => 'Echoes of the Fall', 'duracion' => 204, 'track_number' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album2Id, 'titulo' => 'Beneath the Ashes', 'duracion' => 230, 'track_number' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['lanzamiento_id' => $album2Id, 'titulo' => 'Rebirth', 'duracion' => 193, 'track_number' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // SINGLE 1
        $single1Id = DB::table('lanzamientos')->insertGetId([
            'titulo' => 'Voidwalker',
            'tipo' => 'single',
            'fecha_lanzamiento' => '2023-01-12',
            'descripcion' => 'Single independiente entre álbumes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            'lanzamiento_id' => $single1Id,
            'titulo' => 'Voidwalker',
            'duracion' => 215,
            'track_number' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // SINGLE 2
        $single2Id = DB::table('lanzamientos')->insertGetId([
            'titulo' => 'Black Signal',
            'tipo' => 'single',
            'fecha_lanzamiento' => '2023-09-18',
            'descripcion' => 'Single oscuro y directo.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            'lanzamiento_id' => $single2Id,
            'titulo' => 'Black Signal',
            'duracion' => 228,
            'track_number' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // SINGLE 3
        $single3Id = DB::table('lanzamientos')->insertGetId([
            'titulo' => 'The Hole',
            'tipo' => 'single',
            'fecha_lanzamiento' => '2024-02-12',
            'descripcion' => 'Single profundo.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            'lanzamiento_id' => $single3Id,
            'titulo' => 'The Hole',
            'duracion' => 230,
            'track_number' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
