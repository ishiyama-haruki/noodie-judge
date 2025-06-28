<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class CalcController extends Controller
{
    public function upload(Request $request)
    {
        $file = $request->file('file');
        $path = $file->store('development', 's3');
        Storage::disk('s3')->setVisibility($path, 'public');
        $url = Storage::disk('s3')->url($path);

        return response()->json(['s3Url' => $url]);
    }

    public function nsfwCheck(Request $request)
    {
        $imageUrl = $request->input('s3Url');
        $response = Http::get('http://127.0.0.1:5000', [
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
