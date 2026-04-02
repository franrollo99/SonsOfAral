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
            'tipo_producto' => ['required', 'in:ropa,disco,accesorio'],
            'tiene_talla' => ['required', 'boolean'],
            'tallas_disponibles' => ['nullable', 'array', 'min:1', 'required_if:tiene_talla,true'],
            'tallas_disponibles.*' => ['string', 'max:5'],
            'precio' => ['required', 'numeric', 'min:0'],
            'slug' => ['nullable', 'string', 'max:255'],
            'activo' => ['required', 'boolean'],
            'imagen' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'nombre.string' => 'El nombre del producto debe ser un texto.',
            'nombre.max' => 'El nombre del producto no puede superar los 255 caracteres.',
            'descripcion.string' => 'La descripción debe ser un texto.',
            'tipo_producto.required' => 'Debes seleccionar un tipo de producto.',
            'tipo_producto.in' => 'El tipo de producto seleccionado no es válido.',
            'tiene_talla.required' => 'Debes indicar si el producto tiene talla.',
            'tiene_talla.boolean' => 'El campo tiene talla debe ser verdadero o falso.',
            'tallas_disponibles.required_if' => 'Debes seleccionar al menos una talla cuando el producto tiene talla.',
            'tallas_disponibles.array' => 'Las tallas disponibles deben enviarse en un formato válido.',
            'tallas_disponibles.min' => 'Debes seleccionar al menos una talla.',
            'tallas_disponibles.*.string' => 'Cada talla debe ser un texto.',
            'tallas_disponibles.*.max' => 'Cada talla no puede superar los 5 caracteres.',
            'precio.required' => 'El precio del producto es obligatorio.',
            'precio.numeric' => 'El precio del producto debe ser un número.',
            'precio.min' => 'El precio del producto no puede ser negativo.',
            'slug.string' => 'El slug debe ser un texto.',
            'slug.max' => 'El slug no puede superar los 255 caracteres.',
            'activo.required' => 'Debes indicar si el producto está activo.',
            'activo.boolean' => 'El campo activo debe ser verdadero o falso.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPG, JPEG, PNG o WEBP.',
            'imagen.max' => 'La imagen no puede superar los 2 MB.',
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

        if ($this->has('tiene_talla')) {
            $this->merge([
                'tiene_talla' => filter_var($this->tiene_talla, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? (bool) $this->tiene_talla,
            ]);
        }
    }
}
