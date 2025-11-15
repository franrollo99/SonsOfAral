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
                'lugar' => 'Sala Rockville',
                'ciudad' => 'Madrid',
                'descripcion' => 'Presentación del nuevo álbum con bandas invitadas.',
                'precio_entrada' => 15.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/madrid',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-06-08',
                'lugar' => 'Kafe Antzokia',
                'ciudad' => 'Bilbao',
                'descripcion' => 'Evento solidario junto a bandas locales de metal.',
                'precio_entrada' => 12.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/bilbao',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-09-21',
                'lugar' => 'Sala Master',
                'ciudad' => 'Santiago de Compostela',
                'descripcion' => 'Gira norte: cierre de verano con espectáculo audiovisual.',
                'precio_entrada' => 10.00,
                'entrada_anticipada' => false,
                'enlace_entrada_anticipada' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2024-11-02',
                'lugar' => 'Sala Monasterio',
                'ciudad' => 'Barcelona',
                'descripcion' => 'Halloween Metal Fest — con bandas internacionales.',
                'precio_entrada' => 18.00,
                'entrada_anticipada' => true,
                'enlace_entrada_anticipada' => 'https://entradas.sonsofaral.com/barcelona',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'fecha' => '2025-02-14',
                'lugar' => 'Sala Búnker',
                'ciudad' => 'Santander',
                'descripcion' => 'Concierto especial por San Valentín — setlist acústico.',
                'precio_entrada' => 8.00,
                'entrada_anticipada' => false,
                'enlace_entrada_anticipada' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
