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
            'ciudad'     => $this->ciudad,
            'provincia'  => $this->provincia,
            'cp'         => $this->cp,
        ];
    }
}
