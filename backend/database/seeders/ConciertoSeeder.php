<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConciertoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('conciertos')->insert([
            [
                'fecha' => '2024-04-15',
                'provincia' => 'Cantabria',
                'municipio' => 'Santander',
                'lugar' => 'Sala Rockville',
                'descripcion' => 'Presentación del nuevo álbum con bandas invitadas.',
                'precio_entrada' => 15.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/madrid',
                'imagen' => 'SalaRockVille.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-06-08',
                'provincia' => 'Cantabria',
                'municipio' => 'Santander',
                'lugar' => 'Kafe Antzokia',
                'descripcion' => 'Evento solidario junto a bandas locales de metal.',
                'precio_entrada' => 12.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/bilbao',
                'imagen' => 'SalaRockVille.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-09-21',
                'provincia' => 'Galicia',
                'municipio' => 'Vigo',
                'lugar' => 'Sala Master',
                'descripcion' => 'Gira norte: cierre de verano con espectáculo audiovisual.',
                'precio_entrada' => 10.00,
                'entrada_anticipada' => false,
                'enlace_entrada_anticipada' => null,
                'imagen' => 'SalaRockVille.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-11-02',
                'provincia' => 'Asturias',
                'municipio' => 'Oviedo',
                'lugar' => 'Sala Monasterio',
                'descripcion' => 'Halloween Metal Fest — con bandas internacionales.',
                'precio_entrada' => 18.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/barcelona',
                'imagen' => 'SalaRockVille.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2025-02-14',
                'provincia' => 'Cantabria',
                'municipio' => 'Torrelavega',
                'lugar' => 'Sala Búnker',
                'descripcion' => 'Concierto especial por San Valentín — setlist acústico.',
                'precio_entrada' => 0,
                'entrada_anticipada' => false,
                'enlace_entrada_anticipada' => null,
                'imagen' => 'SalaRockVille.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
