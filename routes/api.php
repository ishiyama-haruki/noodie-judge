<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CalcApiController;
use App\Http\Controllers\API\ImageUploadApiController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('/s3up',[CalcApiController::class, 'upload']);
Route::post('/nsfwCheck',[CalcApiController::class, 'nsfwCheck']);
Route::post('/imageUpload',[ImageUploadApiController::class, 'store']);