<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PedidoStoreRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'nombre_envio' => ['required', 'string', 'max:150'],
            'telefono'     => ['nullable', 'string', 'max:30'],
            'direccion'    => ['required', 'string', 'max:200'],
            'municipio'    => ['required', 'string', 'max:120'],
            'provincia'    => ['required', 'string', 'max:120'],
            'cp'           => ['required', 'string', 'max:10'],
            'metodo_pago'  => ['required', 'string', Rule::in(['tarjeta', 'contra_reembolso'])],
            'gastos_envio' => ['required', 'numeric', 'min:0', 'max:9999'],
            'items'        => ['required', 'array', 'min:1'],
            'items.*.id'   => ['required', 'integer'],
            'items.*.qty'  => ['required', 'integer', 'min:1', 'max:999'],
            'items.*.talla'=> ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_envio.required' => 'El nombre para el envío es obligatorio.',
            'nombre_envio.max'      => 'El nombre para el envío no puede superar 150 caracteres.',
            'direccion.required'    => 'La dirección es obligatoria.',
            'municipio.required'    => 'El municipio es obligatorio.',
            'provincia.required'    => 'La provincia es obligatoria.',
            'cp.required'           => 'El código postal es obligatorio.',
            'metodo_pago.required'  => 'Debes seleccionar un método de pago.',
            'metodo_pago.in'        => 'El método de pago no es válido.',
            'gastos_envio.required' => 'Faltan los gastos de envío.',
            'gastos_envio.numeric'  => 'Los gastos de envío deben ser un número.',
            'items.required'        => 'El carrito está vacío.',
            'items.array'           => 'Formato de carrito inválido.',
            'items.min'             => 'El carrito está vacío.',
            'items.*.id.required'   => 'Hay un producto sin identificador.',
            'items.*.qty.required'  => 'Hay un producto sin cantidad.',
            'items.*.qty.min'       => 'La cantidad mínima por producto es 1.',
        ];
    }
}
