<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConciertoResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'fecha' => $this->fecha,
            'ubicacion' => $this->ubicacion,
            'descripcion' => $this->descripcion,
            'precio_entrada' => $this->precio_entrada,
            'entrada_anticipada' => $this->entrada_anticipada,
            'enlace_entrada_anticipada' => $this->enlace_entrada_anticipada,
            'imagen' => $this->imagenPrincipal()
                ? $this->imagenPrincipal()->ruta
                : null,
        ];
    }
}
