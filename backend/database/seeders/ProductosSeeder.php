<?php

namespace Database\Seeders;

use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productos = [
            ['nombre' => 'Camiseta Sons of Aral - Logo Blanco', 'descripcion' => 'Camiseta negra con el logotipo oficial en blanco.', 'es_ropa' => true, 'tallas_disponibles' => 'S,M,L,XL', 'precio' => 18.00],
            ['nombre' => 'Camiseta Sons of Aral - Tour 2024', 'descripcion' => 'Edición limitada con fechas de la gira impresa en la espalda.', 'es_ropa' => true, 'tallas_disponibles' => 'M,L,XL,XXL', 'precio' => 20.00],
            ['nombre' => 'Sudadera Sons of Aral', 'descripcion' => 'Sudadera con capucha de alta calidad con logo bordado.', 'es_ropa' => true, 'tallas_disponibles' => 'S,M,L,XL', 'precio' => 35.00],
            ['nombre' => 'Gorra Sons of Aral', 'descripcion' => 'Gorra ajustable negra con logotipo metálico.', 'es_ropa' => true, 'tallas_disponibles' => null, 'precio' => 15.00],
            ['nombre' => 'Pulsera de silicona', 'descripcion' => 'Pulsera negra con el texto "Sons of Aral".', 'es_ropa' => false, 'tallas_disponibles' => null, 'precio' => 3.00],
            ['nombre' => 'CD - Echoes of the Void', 'descripcion' => 'Álbum completo en formato físico con libreto.', 'es_ropa' => false, 'tallas_disponibles' => null, 'precio' => 10.00],
            ['nombre' => 'Vinilo - Echoes of the Void', 'descripcion' => 'Edición coleccionista en vinilo de 12 pulgadas.', 'es_ropa' => false, 'tallas_disponibles' => null, 'precio' => 22.00],
            ['nombre' => 'CD - Ashes and Rebirth', 'descripcion' => 'Nuevo álbum con temas inéditos y arte exclusivo.', 'es_ropa' => false, 'tallas_disponibles' => null, 'precio' => 12.00],
            ['nombre' => 'Vinilo - Ashes and Rebirth', 'descripcion' => 'Versión en vinilo rojo transparente.', 'es_ropa' => false, 'tallas_disponibles' => null, 'precio' => 24.00],
            ['nombre' => 'Pack Especial: Camiseta + CD', 'descripcion' => 'Incluye camiseta del tour y CD del último álbum.', 'es_ropa' => false, 'tallas_disponibles' => 'M,L,XL', 'precio' => 25.00],
        ];

        foreach ($productos as $producto) {
            DB::table('productos')->insert([
                'nombre' => $producto['nombre'],
                'descripcion' => $producto['descripcion'],
                'es_ropa' => $producto['es_ropa'],
                'tallas_disponibles' => $producto['tallas_disponibles'],
                'precio' => $producto['precio'],
                'slug' => Str::slug($producto['nombre']),
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
