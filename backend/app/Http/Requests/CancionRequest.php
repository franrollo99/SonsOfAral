<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255',],
            'duracion' => ['required', 'integer', 'min:1',],
            'track_number' => ['nullable', 'integer', 'min:1',],
            'lanzamiento_id' => ['required', 'exists:lanzamientos,id',],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título de la canción es obligatorio.',
            'titulo.string' => 'El título de la canción debe ser un texto.',
            'titulo.max' => 'El título de la canción no puede superar los 255 caracteres.',

            'duracion.required' => 'La duración de la canción es obligatoria.',
            'duracion.integer' => 'La duración debe indicarse en segundos.',
            'duracion.min' => 'La duración debe ser mayor que 0.',

            'track_number.integer' => 'El número de pista debe ser un valor numérico.',
            'track_number.min' => 'El número de pista debe ser mayor que 0.',

            'lanzamiento_id.required' => 'Debes seleccionar un lanzamiento.',
            'lanzamiento_id.exists' => 'El lanzamiento asociado no existe.',
        ];
    }
}
