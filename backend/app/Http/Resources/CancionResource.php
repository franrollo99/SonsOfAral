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
            'lanzamiento' => $this->relationLoaded('lanzamiento')
                ? $this->lanzamiento?->titulo
                : null,
            'titulo' => $this->titulo,
            'duracion' => $this->duracion,
            'duracionFormateada' => sprintf(
                '%02d:%02d',
                intdiv($this->duracion, 60),
                $this->duracion % 60
            ),
            'trackNumber' => $this->track_number,
            'audio' => $this->audio ? [
                'id' => $this->audio->id,
                'url' => $this->audio->url,
                'nombre_original' => $this->audio->nombre_original,
            ] : null,
        ];
    }
}
