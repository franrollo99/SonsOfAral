<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TipoProductoRequest extends FormRequest
{
    public function rules(): array
    {
        $tipoProducto = $this->route('tipoProducto');

        return [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('tipos_productos', 'nombre')
                    ->ignore($tipoProducto?->id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.unique'   => 'Ya existe un tipo de producto con ese nombre.',
            'nombre.max'      => 'El nombre no puede superar los 100 caracteres.',
        ];
    }
}
