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
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'codigo_pedido' => $this->codigo_pedido,
            'estado'        => $this->estado,
            'precio_total'  => (float) $this->precio_total,
            'created_at'    => $this->created_at,
            'nombre_envio'  => $this->nombre_envio,
            'telefono'  => $this->telefono,
            'direccion'     => $this->direccion,
            'municipio'     => $this->municipio,
            'provincia'     => $this->provincia,
            'cp'            => $this->cp,
            'gastos_envio'  => (float) $this->gastos_envio,
            'metodo_pago'   => $this->metodo_pago,
            'productos'     => LineaPedidoResource::collection(
                $this->whenLoaded('lineasPedido')
            ),
        ];
    }
}
