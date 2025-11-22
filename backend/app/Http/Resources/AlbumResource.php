<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AlbumResource extends JsonResource
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
            'titulo' => $this->titulo,
            'fechaLanzamiento' => (string) $this->fecha_lanzamiento,
            'descripcion' => $this->descripcion,
            'canciones' => CancionResource::collection($this->whenLoaded('canciones')),
            'imagen' => new ImagenResource($this->whenLoaded('imagen')),
        ];
    }
}
