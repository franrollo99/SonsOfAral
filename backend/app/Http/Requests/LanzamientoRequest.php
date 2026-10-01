<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LanzamientoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'tipo' => ['required', 'string', Rule::in(['album', 'single', 'EP'])],
            'titulo' => ['required', 'string', 'max:255'],
            'fecha_lanzamiento' => ['nullable', 'date'],
            'descripcion' => ['nullable', 'string'],
            'portada' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'remove_portada' => ['nullable', 'boolean'],
            'compra_url' => ['nullable', 'string', 'max:255'],
            'audio_url' => ['nullable', 'string', 'max:255'],
            'video_url' => ['nullable', 'string', 'max:255'],
            'canciones' => ['required', 'array', 'min:1'],
            'canciones.*.id' => ['nullable', 'integer', 'exists:canciones,id'],
            'canciones.*.track' => ['required', 'integer', 'min:1'],
            'canciones.*.titulo' => ['required', 'string', 'max:255'],
            'canciones.*.duracion' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.in' => 'El tipo de lanzamiento no es válido.',
            'titulo.required' => 'El título es obligatorio.',
            'fecha_lanzamiento.date' => 'La fecha de lanzamiento no es válida.',
            'portada.image' => 'El archivo debe ser una imagen.',
            'portada.mimes' => 'La imagen debe ser JPG, PNG o WEBP.',
            'portada.max' => 'La imagen no puede superar los 2 MB.',
            'remove_portada.boolean' => 'El indicador de borrar portada no es válido.',
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

        if ($this->has('remove_portada')) {
            $this->merge([
                'remove_portada' => filter_var(
                    $this->input('remove_portada'),
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                ) ?? $this->input('remove_portada'),
            ]);
        }
    }
}
