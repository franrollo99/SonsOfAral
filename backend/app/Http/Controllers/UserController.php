<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Http\Resources\PedidoResource;
use App\Models\User;

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/usuarios",
     *     operationId="usuariosIndex",
     *     tags={"Usuarios"},
     *     summary="Lista de usuarios (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de usuarios",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre", type="string", example="Fran"),
     *                     @OA\Property(property="apellidos", type="string", nullable=true, example="Pérez"),
     *                     @OA\Property(property="email", type="string", example="fran@email.com"),
     *                     @OA\Property(property="rol", type="string", example="admin"),
     *                     @OA\Property(property="direccion", type="string", nullable=true, example="Calle X 12"),
     *                     @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                     @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                     @OA\Property(property="cp", type="string", nullable=true, example="39300"),
     *                     @OA\Property(property="created_at", type="string", nullable=true, example="28/02/2026"),
     *                     @OA\Property(property="pedidos_count", type="integer", example=3)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized.")))
     * )
     */
    public function index()
    {
        $users = User::query()
            ->withCount('pedidos')
            ->orderByDesc('created_at')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * @OA\Get(
     *     path="/api/usuarios/{user}",
     *     operationId="usuariosShow",
     *     tags={"Usuarios"},
     *     summary="Detalle de usuario + pedidos (admin)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="user",
     *         in="path",
     *         required=true,
     *         description="ID del usuario",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario y sus pedidos",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="user",
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre", type="string", example="Fran"),
     *                     @OA\Property(property="apellidos", type="string", nullable=true, example="Pérez"),
     *                     @OA\Property(property="email", type="string", example="fran@email.com"),
     *                     @OA\Property(property="rol", type="string", example="cliente"),
     *                     @OA\Property(property="direccion", type="string", nullable=true, example="Calle X 12"),
     *                     @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *                     @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *                     @OA\Property(property="cp", type="string", nullable=true, example="39300"),
     *                     @OA\Property(property="created_at", type="string", nullable=true, example="28/02/2026"),
     *                     @OA\Property(property="pedidos_count", type="integer", example=3)
     *                 ),
     *                 @OA\Property(
     *                     property="pedidos",
     *                     type="array",
     *                     @OA\Items(type="object")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(response=403, description="Sin permisos", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="This action is unauthorized."))),
     *     @OA\Response(response=404, description="No encontrado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="No query results for model [App\\Models\\User] 999")))
     * )
     */
    public function show(User $user)
    {
        $user->load([
            'pedidos' => fn($q) => $q->with('productos')->orderByDesc('created_at'),
        ]);

        return response()->json([
            'data' => [
                'user' => (new UserResource($user))->resolve(),
                'pedidos' => PedidoResource::collection($user->pedidos)->resolve(),
            ],
        ]);
    }
}