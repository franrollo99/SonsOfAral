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
            'compra_url' => ['nullable', 'string', 'max:255'],
            'audio_url'  => ['nullable', 'string', 'max:255'],
            'video_url'  => ['nullable', 'string', 'max:255'],
            'canciones' => ['required', 'array', 'min:1'],
            'canciones.*.id' => ['nullable', 'integer', 'exists:canciones,id'],
            'canciones.*.track' => ['required', 'integer', 'min:1'],
            'canciones.*.titulo' => ['required', 'string', 'max:255'],
            'canciones.*.duracion' => ['required', 'integer', 'min:0'],
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
            'canciones.min' => 'Debes añadir al menos una canción.',
            'canciones.*.titulo.required' => 'El nombre de la canción es obligatorio.',
            'canciones.*.duracion.required' => 'La duración es obligatoria.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('canciones') && is_string($this->canciones)) {
            $decoded = json_decode($this->canciones, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['canciones' => $decoded]);
            }
        }
    }
}
