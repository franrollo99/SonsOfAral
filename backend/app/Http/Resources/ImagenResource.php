<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\JsonResource;

class ImagenResource extends JsonResource
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
            'url' => Storage::url($this->ruta),
            'alt' => $this->alt,
            'mime' => $this->mime,
            'esPrincipal' => (bool) $this->es_principal,
        ];
    }
}
