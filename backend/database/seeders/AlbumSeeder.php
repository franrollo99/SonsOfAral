<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlbumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $album1Id = DB::table('albums')->insertGetId([
            'titulo' => 'Echoes of the Void',
            'fecha_lanzamiento' => '2022-05-20',
            'descripcion' => 'Un álbum que mezcla groove metal con matices progresivos.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            ['album_id' => $album1Id, 'titulo' => 'Into the Abyss', 'duracion' => 242, 'track_number' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album1Id, 'titulo' => 'Burn the Silence', 'duracion' => 198, 'track_number' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album1Id, 'titulo' => 'Crimson Horizon', 'duracion' => 256, 'track_number' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album1Id, 'titulo' => 'Chains of Tomorrow', 'duracion' => 233, 'track_number' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album1Id, 'titulo' => 'Fractured Light', 'duracion' => 211, 'track_number' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Álbum 2
        $album2Id = DB::table('albums')->insertGetId([
            'titulo' => 'Ashes and Rebirth',
            'fecha_lanzamiento' => '2024-03-08',
            'descripcion' => 'Una nueva etapa con sonidos más melódicos y oscuros.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('canciones')->insert([
            ['album_id' => $album2Id, 'titulo' => 'Rise Again', 'duracion' => 221, 'track_number' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album2Id, 'titulo' => 'The Last Flame', 'duracion' => 247, 'track_number' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album2Id, 'titulo' => 'Echoes of the Fall', 'duracion' => 204, 'track_number' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album2Id, 'titulo' => 'Beneath the Ashes', 'duracion' => 230, 'track_number' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['album_id' => $album2Id, 'titulo' => 'Rebirth', 'duracion' => 193, 'track_number' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
