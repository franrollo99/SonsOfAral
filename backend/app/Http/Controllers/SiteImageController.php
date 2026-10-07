<?php

namespace App\Http\Controllers;

use App\Http\Requests\SiteImageRequest;
use App\Models\SiteImage;
use App\Services\MultimediaService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SiteImageController extends Controller
{
    private function defaults(): array
    {
        return json_decode(File::get(resource_path('site-images.json')), true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * @OA\Get(path="/api/contenido-web", tags={"Contenido web"}, summary="Imágenes públicas de la web",
     *
     *     @OA\Response(response=200, description="Foto de Inicio y logo con sus variantes y descripciones")
     * )
     */
    public function index()
    {
        $images = SiteImage::with('multimedia')->get()->keyBy('key');
        $data = [];
        foreach ($this->defaults() as $key => $default) {
            $data[$key] = $this->serialize($images->get($key), $default);
        }

        return response()->json(['data' => $data]);
    }

    /**
     * @OA\Post(path="/api/contenido-web/{key}", tags={"Contenido web"}, summary="Cambiar imagen o descripción (admin)",
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(name="key", in="path", required=true, @OA\Schema(type="string", enum={"home", "logo"})),
     *
     *     @OA\RequestBody(required=true, @OA\MediaType(mediaType="multipart/form-data", @OA\Schema(
     *         required={"_method", "alt"},
     *
     *         @OA\Property(property="_method", type="string", enum={"PUT"}, default="PUT"),
     *         @OA\Property(property="alt", type="string", maxLength=255),
     *         @OA\Property(property="image", type="string", format="binary"),
     *         @OA\Property(property="reset", type="boolean", description="Restaurar respaldo; no combinar con image")
     *     ))),
     *
     *     @OA\Response(response=200, description="Imagen guardada"),
     *     @OA\Response(response=401, description="Sin sesión"),
     *     @OA\Response(response=403, description="Solo administradores"),
     *     @OA\Response(response=422, description="Datos inválidos")
     * )
     */
    public function update(SiteImageRequest $request, string $key, MultimediaService $media)
    {
        $default = $this->defaults()[$key] ?? null;
        abort_unless($default, 404);
        $newMedia = null;
        // Store new files first: a failed upload must not delete the current image.
        if ($request->hasFile('image')) {
            $newMedia = $media->storeImage($request->file('image'), "imagenes/web/{$key}", [], $key === 'logo' ? 'logo' : 'photo');
        }
        try {
            $image = DB::transaction(function () use ($request, $key, $media, $newMedia, $default) {
                SiteImage::firstOrCreate(['key' => $key], ['alt' => $default['alt']]);
                $image = SiteImage::where('key', $key)->lockForUpdate()->firstOrFail();
                $oldMedia = $image->multimedia;
                $replace = $newMedia !== null || $request->boolean('reset');
                $image->update([
                    'alt' => $request->validated('alt'),
                    'multimedia_id' => $replace ? $newMedia?->id : $image->multimedia_id,
                ]);
                if ($replace && $oldMedia) {
                    $media->delete($oldMedia);
                }

                return $image->fresh('multimedia');
            });
        } catch (\Throwable $failure) {
            if ($newMedia) {
                $media->delete($newMedia);
            }
            throw $failure;
        }

        return response()->json(['data' => $this->serialize($image, $default)]);
    }

    private function serialize(?SiteImage $image, array $default): array
    {
        $media = $image?->multimedia;

        return [
            'alt' => $image?->alt ?? $default['alt'],
            'custom' => $media !== null,
            'url' => $media?->url ?? $default['url'],
            'urlSm' => $media?->url_sm ?? $default['urlSm'],
            'variants' => $media?->responsive_variants ?? $default['variants'],
        ];
    }
}
