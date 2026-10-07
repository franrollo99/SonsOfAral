<?php

namespace App\Console\Commands;

use App\Services\ImageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Intervention\Image\ImageManager;

class OptimizeSiteImages extends Command
{
    protected $signature = 'images:optimize-static';

    protected $description = 'Generate optimized fallback images without modifying the original files';

    public function handle(): int
    {
        $frontend = dirname(base_path()).'/frontend';
        $manager = ImageManager::gd();
        $manifest = [];
        foreach (['home' => 'bandaSOA2.png', 'logo' => 'logo.png'] as $key => $source) {
            $logo = $key === 'logo';
            $variants = [];
            $widths = $logo ? ImageService::LOGO_WIDTHS : ImageService::PHOTO_WIDTHS;
            foreach ($widths as $size => $width) {
                $image = $manager->read("{$frontend}/public/images/{$source}")->scaleDown(width: $width);
                $url = '/images/optimized/'.$key.'-'.$size.($logo ? '.png' : '.webp');
                $encoded = (string) ($logo ? $image->toPng() : $image->toWebp(80));
                File::ensureDirectoryExists("{$frontend}/public/images/optimized");
                File::put("{$frontend}/public{$url}", $encoded);
                $variants[] = ['url' => $url, 'width' => $image->width(), 'height' => $image->height(), 'bytes' => strlen($encoded)];
            }
            $manifest[$key] = ['alt' => 'Sons of Aral', 'custom' => false, 'url' => $variants[2]['url'], 'urlSm' => $variants[0]['url'], 'variants' => $variants];
        }
        $json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL;
        File::ensureDirectoryExists("{$frontend}/src/assets");
        File::put("{$frontend}/src/assets/site-images.json", $json);
        File::ensureDirectoryExists(resource_path());
        File::put(resource_path('site-images.json'), $json);
        $this->info('Fallback images generated. Originals are unchanged.');

        return self::SUCCESS;
    }
}
