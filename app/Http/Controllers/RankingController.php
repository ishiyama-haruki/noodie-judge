<?php

namespace App\Http\Controllers;

use App\Models\ImageUpload;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class RankingController extends Controller
{
    public function index()
    {
        $items = ImageUpload::where('visible', 1)
            ->orderByDesc('score')
            ->limit(50)
            ->get();

        $items = $items->map(function ($item) {
            return [
                's3_url' => Storage::disk('s3')->temporaryUrl(
                    $item->s3_key,
                    now()->addMinutes(60)
                ),
                'score' => $item->score,
            ];
        });

        return Inertia::render('Ranking', ['items' => $items]);
    }
}