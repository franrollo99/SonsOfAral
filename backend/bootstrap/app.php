<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {})
    ->withExceptions(function (Exceptions $exceptions) {
        $isApiRequest = static fn (Request $request): bool => $request->is('api/*') || $request->expectsJson();

        $exceptions->shouldRenderJsonWhen(
            static fn (Request $request, \Throwable $exception): bool => $isApiRequest($request)
        );

        $exceptions->render(function (ValidationException $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Los datos enviados no son válidos.',
                'code' => 'VALIDATION_ERROR',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => 'Debes iniciar sesión para realizar esta acción.',
                'code' => 'UNAUTHENTICATED',
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => $exception->getMessage() ?: 'No tienes permisos para realizar esta acción.',
                'code' => 'FORBIDDEN',
            ], 403);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => 'El recurso solicitado no existe.',
                'code' => 'NOT_FOUND',
            ], 404);
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => 'El recurso solicitado no existe.',
                'code' => 'NOT_FOUND',
            ], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            return response()->json([
                'message' => $exception->getStatusCode() === 403
                    ? 'No tienes permisos para realizar esta acción.'
                    : ($exception->getStatusCode() === 429
                        ? 'Has realizado demasiadas solicitudes. Inténtalo más tarde.'
                        : 'La solicitud no se puede completar.'),
                'code' => $exception->getStatusCode() === 403
                    ? 'FORBIDDEN'
                    : ($exception->getStatusCode() === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR'),
            ], $exception->getStatusCode());
        });

        $exceptions->render(function (\Throwable $exception, Request $request) use ($isApiRequest) {
            if (! $isApiRequest($request)) {
                return null;
            }

            report($exception);

            return response()->json([
                'message' => 'Ha ocurrido un error inesperado.',
                'code' => 'INTERNAL_ERROR',
            ], 500);
        });
    })
    ->create();
