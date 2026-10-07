<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Multimedia extends Model
{
    protected $table = 'multimedia';

    protected $fillable = [
        'archivo',
        'directorio',
        'nombre_original',
        'tipo',
        'mime_type',
        'peso',
        'galeria_id',
        'variants',
    ];

    protected $casts = [
        'peso' => 'integer',
        'variants' => 'array',
    ];

    public function galeria()
    {
        return $this->belongsTo(Galeria::class);
    }

    private function buildUrl($size)
    {
        return $this->directorio && $this->archivo
            ? asset("storage/{$this->directorio}/{$size}/{$this->archivo}")
            : null;
    }

    public function getUrlSmAttribute()
    {
        return $this->buildUrl('sm');
    }

    public function getUrlAttribute()
    {
        return $this->buildUrl('lg');
    }

    public function getResponsiveVariantsAttribute(): array
    {
        $variants = [];
        foreach ($this->variants ?? [] as $size => $dimensions) {
            $variants[] = [...$dimensions, 'url' => $this->buildUrl($size)];
        }

        return $variants;
    }
}
