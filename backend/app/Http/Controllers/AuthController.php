<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\UserUpdateRequest;
use Illuminate\Support\Facades\Password;
use App\Http\Requests\UserChangePasswordRequest;

class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     operationId="authRegister",
     *     tags={"Auth"},
     *     summary="Registro de usuario",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre","email","password","password_confirmation"},
     *             @OA\Property(property="nombre", type="string", example="Fran"),
     *             @OA\Property(property="apellidos", type="string", nullable=true, example="Pérez"),
     *             @OA\Property(property="email", type="string", example="fran@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Aa123456!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="Aa123456!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Cuenta creada (requiere verificación por email)",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="nombre", type="string", example="Fran"),
     *                     @OA\Property(property="apellidos", type="string", nullable=true, example="Pérez"),
     *                     @OA\Property(property="email", type="string", example="fran@email.com"),
     *                     @OA\Property(property="rol", type="string", example="cliente"),
     *                     @OA\Property(property="direccion", type="string", nullable=true),
     *                     @OA\Property(property="municipio", type="string", nullable=true),
     *                     @OA\Property(property="provincia", type="string", nullable=true),
     *                     @OA\Property(property="cp", type="string", nullable=true),
     *                     @OA\Property(property="created_at", type="string", nullable=true, example="28/02/2026"),
     *                     @OA\Property(property="pedidos_count", type="integer", example=0)
     *                 )
     *             ),
     *             @OA\Property(property="message", type="string", example="Cuenta creada. Revisa tu correo para verificarla.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(UserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'nombre'    => $data['nombre'],
            'apellidos' => $data['apellidos'] ?? null,
            'email'     => strtolower($data['email']),
            'password'  => Hash::make($data['password']),
            'rol'       => 'cliente',
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json([
            'data' => [
                'user' => (new UserResource($user))->resolve(),
            ],
            'message' => 'Cuenta creada. Revisa tu correo para verificarla.',
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/login",
     *     operationId="authLogin",
     *     tags={"Auth"},
     *     summary="Login",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", example="fran@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Aa123456!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login correcto",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object"),
     *                 @OA\Property(property="token", type="string", example="1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
     *             ),
     *             @OA\Property(property="message", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales incorrectas",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Credenciales incorrectas.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Email no verificado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Debes verificar tu email antes de iniciar sesión.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login(UserLoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where('email', strtolower($data['email']))->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();

            return response()->json([
                'data' => null,
                'message' => 'Debes verificar tu email antes de iniciar sesión.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => [
                'user' => (new UserResource($user))->resolve(),
                'token' => $token,
            ],
            'message' => null,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/logout",
     *     operationId="authLogout",
     *     tags={"Auth"},
     *     summary="Logout",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Sesión cerrada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Sesión cerrada.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     )
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'data' => null,
            'message' => 'Sesión cerrada.',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     operationId="authMe",
     *     tags={"Auth"},
     *     summary="Usuario autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Usuario actual",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object")
     *             ),
     *             @OA\Property(property="message", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado",
     *         @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))
     *     )
     * )
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => (new UserResource($request->user()))->resolve(),
            ],
            'message' => null,
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/auth/profile",
     *     operationId="authProfileUpdate",
     *     tags={"Auth"},
     *     summary="Actualizar perfil",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre"},
     *             @OA\Property(property="nombre", type="string", example="Fran"),
     *             @OA\Property(property="apellidos", type="string", nullable=true, example="Pérez"),
     *             @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
     *             @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
     *             @OA\Property(property="direccion", type="string", nullable=true, example="Calle X 12"),
     *             @OA\Property(property="cp", type="string", nullable=true, example="39300")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Perfil actualizado",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object")
     *             ),
     *             @OA\Property(property="message", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function profileUpdate(UserUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'data' => [
                'user' => (new UserResource($user))->resolve(),
            ],
            'message' => null,
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/auth/change-password",
     *     operationId="authChangePassword",
     *     tags={"Auth"},
     *     summary="Cambiar contraseña",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"current_password","password","password_confirmation"},
     *             @OA\Property(property="current_password", type="string", format="password", example="OldPass123!"),
     *             @OA\Property(property="password", type="string", format="password", example="NewPass123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NewPass123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña actualizada",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Contraseña actualizada correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado", @OA\JsonContent(type="object", @OA\Property(property="message", type="string", example="Unauthenticated."))),
     *     @OA\Response(
     *         response=422,
     *         description="Error (validación o contraseña actual incorrecta)",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="La contraseña actual no es correcta.")
     *         )
     *     )
     * )
     */
    public function changePassword(UserChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'data' => null,
                'message' => 'La contraseña actual no es correcta.',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'data' => null,
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/forgot-password",
     *     operationId="authForgotPassword",
     *     tags={"Auth"},
     *     summary="Solicitar reseteo de contraseña",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", example="fran@email.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="OK (mensaje genérico)",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Si el email existe, te enviamos un enlace para restablecer la contraseña.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink([
            'email' => strtolower($request->input('email')),
        ]);

        return response()->json([
            'data' => null,
            'message' => 'Si el email existe, te enviamos un enlace para restablecer la contraseña.',
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/auth/reset-password",
     *     operationId="authResetPassword",
     *     tags={"Auth"},
     *     summary="Resetear contraseña",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"token","email","password","password_confirmation"},
     *             @OA\Property(property="token", type="string", example="xxxxxxxxxxxxxxxxxxxx"),
     *             @OA\Property(property="email", type="string", example="fran@email.com"),
     *             @OA\Property(property="password", type="string", format="password", example="NewPass123!"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="NewPass123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Contraseña restablecida",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="data", nullable=true, type="object", example=null),
     *             @OA\Property(property="message", type="string", example="Contraseña restablecida correctamente.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error (token inválido o validación)",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'data' => null,
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'data' => null,
            'message' => 'Contraseña restablecida correctamente.',
        ], 200);
    }
}