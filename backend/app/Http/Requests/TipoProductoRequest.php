<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TipoProductoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required','string','max:100','unique:tipos_productos,nombre,' . $this->route('tipos_productos'),],
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
