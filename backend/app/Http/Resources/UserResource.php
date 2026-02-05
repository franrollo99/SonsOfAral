<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'nombre'     => $this->nombre,
            'apellidos'  => $this->apellidos,
            'email'      => $this->email,
            'rol'        => $this->rol,
            'direccion'  => $this->direccion,
            'municipio'  => $this->municipio,
            'provincia'  => $this->provincia,
            'cp'         => $this->cp,
            'created_at' => $this->created_at?->format('d/m/Y'),
            'pedidos_count' => (int) ($this->pedidos_count ?? 0),
        ];
    }
}
