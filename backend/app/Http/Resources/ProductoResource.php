<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'descripcion' => $this->descripcion,
            'tallas_disponibles' => $this->tallas_disponibles,
            'precio' => $this->precio,
            'precio_formateado' => $this->precio_formateado,
            'slug' => $this->slug,
            'activo' => $this->activo,

            'tipo' => new TipoProductoResource(
                $this->whenLoaded('tipo')
            ),
        ];
    }
}
