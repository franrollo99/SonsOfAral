<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CancionController;
use App\Http\Controllers\ConciertoController;
use App\Http\Controllers\GaleriaController;
use App\Http\Controllers\LanzamientoController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

Route::apiResource('lanzamientos', LanzamientoController::class)->only(['index', 'show']);
Route::apiResource('canciones', CancionController::class)->only(['index', 'show']);
Route::apiResource('conciertos', ConciertoController::class)->only(['index', 'show']);
Route::apiResource('galerias', GaleriaController::class)->only(['index', 'show']);

Route::get('/canciones/{id}/audio', [CancionController::class, 'audio']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'profileUpdate']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

});

Route::middleware(['auth:sanctum', 'can:manage-content'])->group(function () {
    Route::post('/conciertos', [ConciertoController::class, 'store']);
    Route::put('/conciertos/{id}', [ConciertoController::class, 'update']);
    Route::delete('/conciertos/{id}', [ConciertoController::class, 'destroy']);

    Route::post('/lanzamientos', [LanzamientoController::class, 'store']);
    Route::put('/lanzamientos/{id}', [LanzamientoController::class, 'update']);
    Route::delete('/lanzamientos/{id}', [LanzamientoController::class, 'destroy']);

    Route::apiResource('galerias', GaleriaController::class)->only(['store', 'update', 'destroy']);

    Route::get('/usuarios', [UserController::class, 'index']);
    Route::get('/usuarios/{user}', [UserController::class, 'show']);
});

Route::get('/email/verify/{id}/{hash}', function (Request $request, $id, $hash) {

    if (! $request->hasValidSignature()) {
        return response()->json([
            'message' => 'Enlace inválido o caducado.',
            'code' => 'INVALID_VERIFICATION_LINK',
        ], 403);
    }

    $user = User::find($id);

    if (! $user) {
        return response()->json([
            'message' => 'Usuario no encontrado.',
            'code' => 'NOT_FOUND',
        ], 404);
    }

    if (! hash_equals(sha1($user->getEmailForVerification()), (string) $hash)) {
        return response()->json([
            'message' => 'Hash inválido.',
            'code' => 'INVALID_VERIFICATION_LINK',
        ], 403);
    }

    if (! $user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

    return redirect()->away($frontendUrl.'/gestion/acceso?verified=1');
})->middleware('signed')->name('verification.verify');
