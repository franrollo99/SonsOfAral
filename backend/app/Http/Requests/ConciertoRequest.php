<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConciertoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'fecha' => ['required', 'date'],
            'provincia' => ['nullable', 'string', 'max:255'],
            'municipio' => ['nullable', 'string', 'max:255'],
            'lugar' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'precio_entrada' => ['nullable', 'numeric', 'min:0'],
            'entrada_anticipada' => ['required', 'boolean'],
            'enlace_entrada_anticipada' => ['nullable', 'string'],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.required' => 'La fecha del concierto es obligatoria.',
            'fecha.date' => 'La fecha del concierto no tiene un formato válido.',

            'provincia.string' => 'La provincia debe ser un texto.',
            'provincia.max' => 'La provincia no puede superar los 255 caracteres.',

            'municipio.string' => 'El municipio debe ser un texto.',
            'municipio.max' => 'El municipio no puede superar los 255 caracteres.',

            'lugar.required' => 'El lugar del concierto es obligatorio.',
            'lugar.string' => 'El lugar del concierto debe ser un texto.',
            'lugar.max' => 'El lugar del concierto no puede superar los 255 caracteres.',

            'descripcion.string' => 'La descripción debe ser un texto.',

            'precio_entrada.numeric' => 'El precio de la entrada debe ser un número.',
            'precio_entrada.min' => 'El precio de la entrada no puede ser negativo.',

            'entrada_anticipada.required' => 'Debes indicar si existe entrada anticipada.',
            'entrada_anticipada.boolean' => 'El campo entrada anticipada debe ser verdadero o falso.',

            'enlace_entrada_anticipada.string' => 'El enlace de la entrada anticipada debe ser un texto.',

            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPG, PNG o WEBP.',
            'imagen.max'   => 'La imagen no puede superar los 2 MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->entrada_anticipada) {
            $this->merge(['enlace_entrada_anticipada' => null]);
        }
    }
}
