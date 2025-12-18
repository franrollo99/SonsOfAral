<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CancionResource extends JsonResource
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
            'lanzamientoId' => $this->lanzamiento_id,
            'titulo' => $this->titulo,
            'duracion' => $this->duracion,
            'trackNumber' => $this->track_number,
        ];
    }
}
