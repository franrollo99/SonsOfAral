<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'), // contraseña por defecto
            'rol' => 'cliente',
            'direccion' => fake()->streetAddress(),
            'municipio' => fake()->city(),
            'provincia' => fake()->state(),
            'cp' => fake()->postcode(),
            'remember_token' => Str::random(10),
        ];
    }
}
