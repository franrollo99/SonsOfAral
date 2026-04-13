<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GaleriaResource extends JsonResource
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
            'nombre' => $this->nombre,
            'conciertoId' => $this->concierto_id,
            'portadaId' => $this->portada_id,

            'concierto' => $this->whenLoaded('concierto', function () {
                return [
                    'id' => $this->concierto->id,
                    'fecha' => $this->concierto->fecha,
                    'lugar' => $this->concierto->lugar,
                    'municipio' => $this->concierto->municipio,
                    'provincia' => $this->concierto->provincia,
                ];
            }),

            'portada' => $this->whenLoaded('portada', function () {
                return [
                    'id' => $this->portada->id,
                    'url' => $this->portada->url,
                    'urlSm' => $this->portada->url_sm,
                    'nombre_original' => $this->portada->nombre_original,
                    'tipo' => $this->portada->tipo,
                    'mime_type' => $this->portada->mime_type,
                    'peso' => $this->portada->peso,
                ];
            }),

            'imagenes' => $this->whenLoaded('imagenes', function () {
                return $this->imagenes
                    ->filter(function ($imagen) {
                        return (int) $imagen->id !== (int) $this->portada_id;
                    })
                    ->map(function ($imagen) {
                        return [
                            'id' => $imagen->id,
                            'url' => $imagen->url,
                            'urlSm' => $imagen->url_sm,
                            'nombre_original' => $imagen->nombre_original,
                            'tipo' => $imagen->tipo,
                            'mime_type' => $imagen->mime_type,
                            'peso' => $imagen->peso,
                        ];
                    })
                    ->values();
            }),
        ];
    }
}
