<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LanzamientoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tipo' => ['required', 'string', Rule::in(['album', 'single', 'ep'])],
            'titulo' => ['required', 'string', 'max:255'],
            'fecha_lanzamiento' => ['nullable', 'date'],
            'descripcion' => ['nullable', 'string'],
            'imagen_id' => ['nullable', 'exists:imagenes,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.in' => 'El tipo de lanzamiento no es válido.',
            'titulo.required' => 'El título es obligatorio.',
            'fecha_lanzamiento.date' => 'La fecha de lanzamiento no es válida.',
            'imagen_id.exists' => 'La imagen seleccionada no existe.',
        ];
    }
}
