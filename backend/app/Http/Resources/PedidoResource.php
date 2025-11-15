<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'estado'       => $this->estado,
            'precio_total' => $this->precio_total,

            // Opcionales, solo si cargas las relaciones:
            'usuario'   => new UserResource($this->whenLoaded('usuario')),
            'productos' => PedidoProductoResource::collection(
                $this->whenLoaded('productos')
            ),
        ];
    }
}
