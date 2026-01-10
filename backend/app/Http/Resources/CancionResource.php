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
            'duracionFormateada' => sprintf(
                '%02d:%02d',
                intdiv($this->duracion, 60),
                $this->duracion % 60
            ),
            'trackNumber' => $this->track_number,
        ];
    }
}
