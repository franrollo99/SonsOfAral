<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConciertoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'fecha' => (string) $this->fecha,
            'lugar' => $this->lugar,
            'ciudad' => $this->ciudad,
            'descripcion' => $this->descripcion,
            'precioEntrada' => $this->precio_entrada,
            'entradaAnticipada' => (bool) $this->entrada_anticipada,
            'enlaceEntradaAnticipada' => $this->enlace_entrada_anticipada,
            'imagen' => new ImagenResource($this->whenLoaded('imagen')),
        ];
    }
}
