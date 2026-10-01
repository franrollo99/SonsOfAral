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
            'titulo' => ['nullable', 'required_if:tipo,banda', 'string', 'max:255'],
            'concierto_id' => ['nullable', 'integer', 'exists:conciertos,id', 'required_if:tipo,concierto'],
            'portada' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'imagenes' => ['nullable', 'array', 'max:20'],
            'imagenes.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:3072'],
            'remove_portada' => ['nullable', 'boolean'],
            'remove_imagen_ids' => ['nullable', 'array'],
            'remove_imagen_ids.*' => ['integer', 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'tipo.required' => 'El tipo de galería es obligatorio.',
            'tipo.in' => 'El tipo de galería debe ser concierto o banda.',

            'titulo.required_if' => 'El título es obligatorio para una galería de banda.',
            'titulo.string' => 'El título de la galería debe ser un texto.',
            'titulo.max' => 'El título de la galería no puede superar los 255 caracteres.',

            'concierto_id.required_if' => 'Debes seleccionar un concierto para una galería de tipo concierto.',
            'concierto_id.integer' => 'El concierto asociado no es válido.',
            'concierto_id.exists' => 'El concierto asociado no existe.',

            'portada.image' => 'La portada debe ser una imagen válida.',
            'portada.mimes' => 'La portada debe ser JPG, JPEG, PNG o WEBP.',
            'portada.max' => 'La portada no puede superar los 3 MB.',
            'imagenes.array' => 'Las imágenes deben enviarse en un formato válido.',
            'imagenes.max' => 'No puedes subir más de 20 imágenes a la vez.',
            'imagenes.*.image' => 'Cada archivo debe ser una imagen válida.',
            'imagenes.*.mimes' => 'Las imágenes deben ser JPG, JPEG, PNG o WEBP.',
            'imagenes.*.max' => 'Cada imagen no puede superar los 3 MB.',
            'remove_portada.boolean' => 'El indicador de borrar portada no es válido.',
            'remove_imagen_ids.array' => 'Las imágenes a borrar deben enviarse como una lista.',
            'remove_imagen_ids.*.integer' => 'El identificador de imagen no es válido.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('remove_imagen_ids'))) {
            $ids = json_decode($this->input('remove_imagen_ids'), true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['remove_imagen_ids' => $ids]);
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
