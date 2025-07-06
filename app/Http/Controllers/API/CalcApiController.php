<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class CalcApiController extends Controller
{
    public function upload(Request $request)
    {
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return response()->json([
                'error' => 'ファイルがアップロードされていません、または無効です'
            ], 422);
        }

        $file = $request->file('file');
        $directory = env('AWS_S3_DIR', 'development');
        $path = $file->store($directory, 's3');

        $signedUrl = Storage::disk('s3')->temporaryUrl(
            $path,
            now()->addMinutes(60)
        );

        return response()->json([
            's3Url' => $signedUrl,
            's3Key' => $path,
        ]);
    }


    public function nsfwCheck(Request $request)
    {
        $imageUrl = $request->input('s3Url');
        $nsfwApiUrl = env('NSFW_API_URL', 'http://127.0.0.1:5000');
        $response = Http::get($nsfwApiUrl, [
            'url' => $imageUrl,
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            return response()->json([
                'error' => 'NSFWチェックAPI呼び出し失敗',
                'details' => $response->body(),
            ], $response->status());
        }
    }
}
