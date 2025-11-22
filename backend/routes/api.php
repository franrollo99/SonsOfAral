<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\CancionController;
use App\Http\Controllers\ConciertoController;
use Illuminate\Support\Facades\Route;

Route::apiResource('albums', AlbumController::class)->only(['index', 'show']);
Route::apiResource('canciones', CancionController::class)->only(['index', 'show']);
Route::apiResource('conciertos', ConciertoController::class)->only(['index', 'show']);
