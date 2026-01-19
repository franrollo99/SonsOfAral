<?php

namespace App\Http\Resources;

use Carbon\Carbon;
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
            'fecha_formateada' => $this->fecha
                ? Carbon::parse($this->fecha)
                    ->locale('es')
                    ->translatedFormat('d \d\e F, Y')
                : null,
            'provincia' => $this->provincia,
            'municipio' => $this->municipio,
            'lugar' => $this->lugar,
            'descripcion' => $this->descripcion,
            'precioEntrada' => $this->precio_entrada,
            'entradaAnticipada' => (bool) $this->entrada_anticipada,
            'enlaceEntradaAnticipada' => $this->enlace_entrada_anticipada,
            'imagen' => new ImagenResource($this->whenLoaded('imagen')),
        ];
    }
}
