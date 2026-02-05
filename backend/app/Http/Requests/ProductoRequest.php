<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'tallas_disponibles' => ['nullable'],
            'precio' => ['required', 'numeric', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255'],
            'activo' => ['required', 'boolean'],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'tipo_producto_id' => ['required', 'integer', 'exists:tipos_productos,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'nombre.string' => 'El nombre del producto debe ser un texto.',
            'nombre.max' => 'El nombre del producto no puede superar los 255 caracteres.',

            'descripcion.string' => 'La descripción debe ser un texto.',

            'precio.required' => 'El precio del producto es obligatorio.',
            'precio.numeric' => 'El precio del producto debe ser un número.',
            'precio.min' => 'El precio del producto no puede ser negativo.',

            'slug.string' => 'El slug debe ser un texto.',
            'slug.max' => 'El slug no puede superar los 255 caracteres.',

            'activo.required' => 'Debes indicar si el producto está activo.',
            'activo.boolean' => 'El campo activo debe ser verdadero o falso.',

            'tipo_producto_id.required' => 'Debes seleccionar un tipo de producto.',
            'tipo_producto_id.integer' => 'El tipo de producto no es válido.',
            'tipo_producto_id.exists' => 'El tipo de producto seleccionado no existe.',

            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPG, PNG o WEBP.',
            'imagen.max'   => 'La imagen no puede superar los 2 MB.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('activo')) {
            $this->merge([
                'activo' => filter_var($this->activo, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $this->activo,
            ]);
        }

        if ($this->has('precio') && $this->precio !== null && $this->precio !== '') {
            $this->merge(['precio' => (float) $this->precio]);
        }

        if ($this->has('tipo_producto_id') && $this->tipo_producto_id !== null && $this->tipo_producto_id !== '') {
            $this->merge(['tipo_producto_id' => (int) $this->tipo_producto_id]);
        }
    }
}
