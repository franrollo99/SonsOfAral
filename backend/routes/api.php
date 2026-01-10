<?php

use App\Http\Controllers\CancionController;
use App\Http\Controllers\ConciertoController;
use App\Http\Controllers\LanzamientoController;
use App\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;

Route::apiResource('lanzamientos', LanzamientoController::class)->only(['index', 'show']);
Route::apiResource('canciones', CancionController::class)->only(['index', 'show']);
Route::apiResource('conciertos', ConciertoController::class)->only(['index', 'show']);
Route::apiResource('productos', ProductoController::class)->only(['index', 'show']);
