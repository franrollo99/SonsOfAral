<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoProductoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'nombre_producto'        => $this->nombre_producto,
            'talla'                  => $this->talla,
            'cantidad'               => $this->cantidad,
            'precio_unitario_snapshot' => (float) $this->precio_unitario_snapshot,
            'subtotal'               => (float) $this->subtotal,
        ];
    }
}
