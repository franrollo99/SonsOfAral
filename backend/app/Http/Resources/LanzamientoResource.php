<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class LanzamientoResource extends JsonResource
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
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'fechaLanzamiento' => (string) $this->fecha_lanzamiento,
            'fechaFormateada' => $this->fecha_lanzamiento
                ? Carbon::parse($this->fecha_lanzamiento)
                ->locale('es')
                ->translatedFormat('d F Y')
                : null,

            'descripcion' => $this->descripcion,
            'canciones' => CancionResource::collection($this->whenLoaded('canciones')),
            'imagen' => new ImagenResource($this->whenLoaded('imagen')),
        ];
    }
}
