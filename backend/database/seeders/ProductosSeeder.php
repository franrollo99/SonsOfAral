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
            ['nombre' => 'Camiseta Sons of Aral - Logo Blanco', 'descripcion' => 'Camiseta negra con el logotipo oficial en blanco.', 'tipo_producto_id' => 1, 'tallas_disponibles' => ['S', 'M', 'L', 'XL'], 'precio' => 18.00],
            ['nombre' => 'Camiseta Sons of Aral - Tour 2024', 'descripcion' => 'Edición limitada con fechas de la gira impresa en la espalda.', 'tipo_producto_id' => 1, 'tallas_disponibles' => ['M', 'L', 'XL', 'XXL'], 'precio' => 20.00],
            ['nombre' => 'Sudadera Sons of Aral', 'descripcion' => 'Sudadera con capucha de alta calidad con logo bordado.', 'tipo_producto_id' => 1, 'tallas_disponibles' => ['S', 'M', 'L', 'XL'], 'precio' => 35.00],
            ['nombre' => 'Gorra Sons of Aral', 'descripcion' => 'Gorra ajustable negra con logotipo metálico.', 'tipo_producto_id' => 3, 'tallas_disponibles' => null, 'precio' => 15.00],
            ['nombre' => 'Pulsera de silicona', 'descripcion' => 'Pulsera negra con el texto "Sons of Aral".', 'tipo_producto_id' => 3, 'tallas_disponibles' => null, 'precio' => 3.00],
            ['nombre' => 'CD - Echoes of the Void', 'descripcion' => 'Álbum completo en formato físico con libreto.', 'tipo_producto_id' => 2, 'tallas_disponibles' => null, 'precio' => 10.00],
            ['nombre' => 'CD - Ashes and Rebirth', 'descripcion' => 'Nuevo álbum con temas inéditos y arte exclusivo.', 'tipo_producto_id' => 2, 'tallas_disponibles' => null, 'precio' => 12.00],
            ['nombre' => 'Parches', 'descripcion' => 'Parches para poner en tus pantalones o chaquetas vaqueras.', 'tipo_producto_id' => 4, 'tallas_disponibles' => null, 'precio' => 25.00],
        ];

        foreach ($productos as $producto) {
            DB::table('productos')->insert([
                'tipo_producto_id' => $producto['tipo_producto_id'],
                'nombre' => $producto['nombre'],
                'descripcion' => $producto['descripcion'],
                'tallas_disponibles' => is_array($producto['tallas_disponibles'])
                    ? json_encode($producto['tallas_disponibles'])
                    : null,
                'precio' => $producto['precio'],
                'slug' => Str::slug($producto['nombre']),
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
