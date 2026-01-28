<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PedidoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'codigo_pedido' => $this->codigo_pedido,
            'estado'        => $this->estado,
            'precio_total'  => (float) $this->precio_total,
            'created_at'    => $this->created_at,
            'productos'     => PedidoProductoResource::collection(
                $this->whenLoaded('productos')
            ),
        ];
    }
}
