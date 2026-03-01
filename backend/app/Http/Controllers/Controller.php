<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *     title="API de Sons of Aral Website",
 *     version="1.0",
 *     description="Documentación de la API para Sons of Aral Website"
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
