<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * Shared response schemas used by the Swagger documentation.
 *
 * @OA\Schema(
 *     schema="Concierto",
 *     type="object",
 *     required={"id", "fecha", "lugar", "entradaAnticipada"},
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="fecha", type="string", format="date", example="2026-08-26"),
 *     @OA\Property(property="fecha_formateada", type="string", nullable=true, example="26 de agosto, 2026"),
 *     @OA\Property(property="provincia", type="string", nullable=true, example="Cantabria"),
 *     @OA\Property(property="municipio", type="string", nullable=true, example="Torrelavega"),
 *     @OA\Property(property="lugar", type="string", example="Sala Example"),
 *     @OA\Property(property="descripcion", type="string", nullable=true),
 *     @OA\Property(property="precioEntrada", type="number", format="float", nullable=true, example=12.5),
 *     @OA\Property(property="entradaAnticipada", type="boolean", example=true),
 *     @OA\Property(property="enlaceEntradaAnticipada", type="string", nullable=true, format="uri"),
 *     @OA\Property(property="cartel", type="object", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Lanzamiento",
 *     type="object",
 *     required={"id", "tipo", "titulo"},
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="tipo", type="string", enum={"album", "EP", "single"}, example="album"),
 *     @OA\Property(property="titulo", type="string", example="Nemesis"),
 *     @OA\Property(property="fechaLanzamiento", type="string", format="date", nullable=true),
 *     @OA\Property(property="fechaFormateada", type="string", nullable=true),
 *     @OA\Property(property="descripcion", type="string", nullable=true),
 *     @OA\Property(property="duracionTotalMinutos", type="integer", nullable=true),
 *     @OA\Property(property="canciones", type="array", @OA\Items(type="object")),
 *     @OA\Property(property="compraUrl", type="string", nullable=true, format="uri"),
 *     @OA\Property(property="audioUrl", type="string", nullable=true, format="uri"),
 *     @OA\Property(property="videoUrl", type="string", nullable=true, format="uri"),
 *     @OA\Property(property="portada", type="object", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Galeria",
 *     type="object",
 *     required={"id", "tipo", "nombre"},
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="tipo", type="string", enum={"concierto", "banda"}),
 *     @OA\Property(property="titulo", type="string", nullable=true),
 *     @OA\Property(property="nombre", type="string"),
 *     @OA\Property(property="conciertoId", type="integer", nullable=true),
 *     @OA\Property(property="portadaId", type="integer", nullable=true),
 *     @OA\Property(property="concierto", type="object", nullable=true),
 *     @OA\Property(property="portada", type="object", nullable=true),
 *     @OA\Property(property="imagenes", type="array", @OA\Items(type="object"))
 * )
 */
final class Schemas {}
