<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GaleriaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tipo' => ['required', Rule::in(['concierto', 'banda'])],
            'titulo' => ['nullable', 'string', 'max:255'],
            'concierto_id' => ['nullable', 'integer', 'exists:conciertos,id', 'required_if:tipo,concierto'],
            'portada_id' => ['nullable', 'integer', 'exists:multimedia,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de galería es obligatorio.',
            'tipo.in' => 'El tipo de galería debe ser concierto o banda.',

            'titulo.string' => 'El título de la galería debe ser un texto.',
            'titulo.max' => 'El título de la galería no puede superar los 255 caracteres.',

            'concierto_id.required_if' => 'Debes seleccionar un concierto para una galería de tipo concierto.',
            'concierto_id.integer' => 'El concierto asociado no es válido.',
            'concierto_id.exists' => 'El concierto asociado no existe.',

            'portada_id.integer' => 'La portada seleccionada no es válida.',
            'portada_id.exists' => 'La portada seleccionada no existe.',
        ];
    }
}