<?php

namespace App\Http\Controllers;

use App\Http\Resources\PedidoResource;
use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    /**
     * GET /api/pedidos
     * - Admin: devuelve TODOS los pedidos
     * - Cliente: devuelve SOLO sus pedidos
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $isAdmin = ($user->role ?? $user->rol ?? null) === 'admin';

        $query = Pedido::query()->with('productos');

        if (!$isAdmin) {
            $query->where('user_id', $user->id);
        }

        $pedidos = $query->get();

        return PedidoResource::collection($pedidos);
    }

    /**
     * GET /api/pedidos/{pedido}
     * - Admin: puede ver cualquiera
     * - Cliente: solo si es suyo
     */
    public function show(Request $request, Pedido $pedido)
    {
        $user = $request->user();

        $isAdmin = ($user->role ?? $user->rol ?? null) === 'admin';

        if (!$isAdmin && (int) $pedido->user_id !== (int) $user->id) {
            abort(403, 'No tienes permisos para ver este pedido.');
        }

        $pedido->load('productos');

        return new PedidoResource($pedido);
    }
}
