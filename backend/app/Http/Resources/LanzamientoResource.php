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
            'duracionTotalMinutos' => $this->relationLoaded('canciones')
                ? intdiv($this->canciones->sum('duracion'), 60)
                : null,
            'canciones' => CancionResource::collection($this->whenLoaded('canciones')),
            'compraUrl' => $this->compra_url,
            'audioUrl' => $this->audio_url,
            'videoUrl' => $this->video_url,
            'portada' => $this->portada ? [
                'id' => $this->portada->id,
                'url' => $this->portada->url,
                'urlSm' => $this->portada->url_sm,
                'nombre_original' => $this->portada->nombre_original,
            ] : null,
        ];
    }
}
