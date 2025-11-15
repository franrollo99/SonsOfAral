<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;

Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
