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
            'tipo_producto' => $this->tipo_producto,
            'tiene_talla' => $this->tiene_talla,
            'tallas_disponibles' => $this->tallas_disponibles,
            'precio' => $this->precio,
            'precio_formateado' => $this->precio_formateado,
            'slug' => $this->slug,
            'activo' => $this->activo ? 1 : 0,
            'imagen' => $this->imagen ? [
                'id' => $this->imagen->id,
                'url' => $this->imagen->url,
                'nombre_original' => $this->imagen->nombre_original,
            ] : null,
        ];
    }
}
