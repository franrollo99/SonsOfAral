<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CancionController;
use App\Http\Controllers\ConciertoController;
use App\Http\Controllers\GaleriaController;
use App\Http\Controllers\LanzamientoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

Route::apiResource('lanzamientos', LanzamientoController::class)->only(['index', 'show']);
Route::apiResource('canciones', CancionController::class)->only(['index', 'show']);
Route::apiResource('conciertos', ConciertoController::class)->only(['index', 'show']);
Route::apiResource('galerias', GaleriaController::class);
Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);

Route::get('/canciones/{id}/audio', [CancionController::class, 'audio']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'profileUpdate']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show']);
    Route::post('/pedidos', [PedidoController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/conciertos', [ConciertoController::class, 'store']);
    Route::put('/conciertos/{id}', [ConciertoController::class, 'update']);
    Route::delete('/conciertos/{id}', [ConciertoController::class, 'destroy']);

    Route::post('/lanzamientos', [LanzamientoController::class, 'store']);
    Route::put('/lanzamientos/{id}', [LanzamientoController::class, 'update']);
    Route::delete('/lanzamientos/{id}', [LanzamientoController::class, 'destroy']);

    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

    Route::put('/pedidos/{pedido}', [PedidoController::class, 'update']);

    Route::get('/usuarios', [UserController::class, 'index']);
    Route::get('/usuarios/{user}', [UserController::class, 'show']);
});

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {

    if (!$request->hasValidSignature()) {
        return response()->json(['message' => 'Enlace inválido o caducado.'], 403);
    }

    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'Usuario no encontrado.'], 404);
    }

    if (!hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
        return response()->json(['message' => 'Hash inválido.'], 403);
    }

    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect()->away($frontendUrl . '/login?verified=1');
})->middleware('signed')->name('verification.verify');
