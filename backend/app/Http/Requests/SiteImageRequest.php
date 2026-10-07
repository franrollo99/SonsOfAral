<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteImageRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120', 'dimensions:max_width=8000,max_height=8000'],
            'alt' => ['required', 'string', 'max:255'],
            'reset' => ['sometimes', 'boolean', 'prohibits:image'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'Selecciona una imagen válida.',
            'image.mimes' => 'Usa PNG, JPG o WebP. SVG no está habilitado para las subidas.',
            'image.max' => 'La imagen enviada no puede superar los 5 MB.',
            'image.dimensions' => 'La imagen no puede superar los 8000 píxeles por lado.',
            'alt.required' => 'Añade una descripción de la imagen.',
            'alt.max' => 'La descripción no puede superar los 255 caracteres.',
        ];
    }
}
