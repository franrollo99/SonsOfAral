<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteImage extends Model
{
    protected $fillable = ['key', 'multimedia_id', 'alt'];

    public function multimedia(): BelongsTo
    {
        return $this->belongsTo(Multimedia::class);
    }
}
