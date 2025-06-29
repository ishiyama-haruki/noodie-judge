<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImageUpload;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ImageUploadController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                's3_key' => 'required|string',
                'score' => 'required|numeric',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'バリデーションエラー',
                'errors' => $e->errors()
            ], 422);
        }

        $upload = ImageUpload::create($validated);

        return response()->json([
            'message' => '保存成功',
            'data' => $upload,
        ]);
    }
}
