<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\TipoProductoRequest;
use App\Http\Resources\TipoProductoResource;
use App\Models\TipoProducto;
use Illuminate\Http\Response;

class TipoProductoController extends Controller
{
    public function index()
    {
        return TipoProductoResource::collection(
            TipoProducto::orderBy('nombre')->get()
        );
    }

    public function store(TipoProductoRequest $request)
    {
        $tipoProducto = TipoProducto::create($request->validated());

        return response()->json(
            new TipoProductoResource($tipoProducto),
            Response::HTTP_CREATED
        );
    }

    public function show(TipoProducto $tipoProducto)
    {
        return new TipoProductoResource($tipoProducto);
    }

    public function update(TipoProductoRequest $request, TipoProducto $tipoProducto)
    {
        $tipoProducto->update($request->validated());

        return new TipoProductoResource($tipoProducto);
    }

    public function destroy(TipoProducto $tipoProducto)
    {
        $tipoProducto->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
