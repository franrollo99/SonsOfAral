<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'nombre'    => ['required', 'string', 'max:100'],
            'apellidos' => ['nullable', 'string', 'max:150'],
            'provincia' => ['nullable', 'string', 'max:100'],
            'municipio' => ['nullable', 'string', 'max:100'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'cp'        => ['nullable', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe introducirse como texto.',
            'nombre.max'      => 'El nombre no puede superar los 100 caracteres.',
            'apellidos.string' => 'Los apellidos deben ser un texto válido.',
            'apellidos.max'    => 'Los apellidos no pueden superar los 150 caracteres.',
            'provincia.string' => 'La provincia debe ser un texto válido.',
            'provincia.max'    => 'La provincia no puede superar los 100 caracteres.',
            'municipio.string' => 'El municipio debe ser un texto válido.',
            'municipio.max'    => 'El municipio no puede superar los 100 caracteres.',
            'direccion.string' => 'La dirección debe ser un texto válido.',
            'direccion.max'    => 'La dirección no puede superar los 255 caracteres.',
            'cp.string' => 'El código postal debe ser un texto válido.',
            'cp.max'    => 'El código postal no puede superar los 10 caracteres.',
        ];
    }
}
