<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Mostrar todos los usuarios.
     */
    public function index()
    {
        return UserResource::collection(User::all());
    }

    /**
     * Crear un nuevo usuario.
     */
    public function store(Request $request)
    {

    }

    /**
     * Mostrar un usuario concreto.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Actualizar un usuario.
     */
    public function update(Request $request){

    }

    /**
     * Eliminar un usuario.
     */
    public function destroy(User $user)
{
    $user->delete();

    return response()->json(['message' => 'Usuario eliminado correctamente']);
}
}
