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
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.in' => 'El tipo de lanzamiento no es válido.',
            'titulo.required' => 'El título es obligatorio.',
            'fecha_lanzamiento.date' => 'La fecha de lanzamiento no es válida.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPG, PNG o WEBP.',
            'imagen.max'   => 'La imagen no puede superar los 2 MB.',
        ];
    }
}
