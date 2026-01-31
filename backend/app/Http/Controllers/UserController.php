<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Http\Resources\PedidoResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->withCount('pedidos')
            ->orderByDesc('created_at')
            ->get();

        return UserResource::collection($users);
    }


    public function show(User $user)
    {
        $user->load([
            'pedidos' => fn($q) =>
            $q->with('productos')->orderByDesc('created_at'),
        ]);

        return response()->json([
            'user' => new UserResource($user),
            'pedidos' => PedidoResource::collection($user->pedidos),
        ]);
    }
}
