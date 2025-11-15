<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="API de Reto Grupo 2",
 *     version="1.0",
 *     description="Documentación de la API para el proyecto Reto Grupo 2",
 *     @OA\Contact(
 *         email="tu-email@example.com"
 *     )
 * )
 */
class Controller extends BaseController
{
    /**
     * @OA\SecurityScheme(
     *     securityScheme="bearerAuth",
     *     type="http",
     *     scheme="bearer",
     *     bearerFormat="JWT",
     *     description="Use un token de autenticación para acceder a los endpoints"
     * )
     */
}
