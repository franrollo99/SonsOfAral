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
        $nombre = $this->nombre_producto ?? ($this->producto->nombre ?? null);
        $precio = $this->precio_unitario_snapshot;

        return [
            'id' => $this->id,
            'nombre' => $nombre,
            'precio' => (float) $precio,
            'nombre_producto' => $this->nombre_producto,
            'talla' => $this->talla,
            'cantidad' => (int) $this->cantidad,
            'precio_unitario_snapshot' => (float) $this->precio_unitario_snapshot,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
