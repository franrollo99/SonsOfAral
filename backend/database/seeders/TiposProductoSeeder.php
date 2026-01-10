<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TiposProductoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            ['id' => 1, 'nombre' => 'Ropa'],
            ['id' => 2, 'nombre' => 'Discos'],
            ['id' => 3, 'nombre' => 'Accesorios'],
            ['id' => 4, 'nombre' => 'Otros'],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipos_producto')->insert([
                'id' => $tipo['id'],
                'nombre' => $tipo['nombre'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
