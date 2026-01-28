<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CancionController;
use App\Http\Controllers\ConciertoController;
use App\Http\Controllers\LanzamientoController;
use App\Http\Controllers\TipoProductoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\PedidoController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::apiResource('lanzamientos', LanzamientoController::class)->only(['index', 'show']);
Route::apiResource('canciones', CancionController::class)->only(['index', 'show']);
Route::apiResource('conciertos', ConciertoController::class)->only(['index', 'show']);
Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/pedidos', [PedidoController::class, 'index']);
    Route::get('/pedidos/{pedido}', [PedidoController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/conciertos', [ConciertoController::class, 'store']);
    Route::put('/conciertos/{id}', [ConciertoController::class, 'update']);
    Route::delete('/conciertos/{id}', [ConciertoController::class, 'destroy']);

    Route::post('/lanzamientos', [LanzamientoController::class, 'store']);
    Route::put('/lanzamientos/{id}', [LanzamientoController::class, 'update']);
    Route::delete('/lanzamientos/{id}', [LanzamientoController::class, 'destroy']);

    Route::post('/canciones', [CancionController::class, 'store']);
    Route::put('/canciones/{id}', [CancionController::class, 'update']);
    Route::delete('/canciones/{id}', [CancionController::class, 'destroy']);

    Route::post('/', [CancionController::class, 'store']);
    Route::put('/canciones/{id}', [CancionController::class, 'update']);
    Route::delete('/canciones/{id}', [CancionController::class, 'destroy']);
    
    Route::get('/tipos-productos', [TipoProductoController::class, 'index']);
    Route::get('/tipos-productos/{id}', [TipoProductoController::class, 'show']);
    Route::post('/tipos-productos', [TipoProductoController::class, 'store']);
    Route::put('/tipos-productos/{tipoProducto}', [TipoProductoController::class, 'update']);
    Route::delete('/tipos-productos/{tipoProducto}', [TipoProductoController::class, 'destroy']);

    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::delete('/productos/{producto}', [ProductoController::class, 'destroy']);

    Route::put('/pedidos/{pedido}', [PedidoController::class, 'update']);
});
