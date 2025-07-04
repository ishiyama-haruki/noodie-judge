<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageUpload extends Model
{
    use HasFactory;

    protected $casts = [
        'score' => 'float',
    ];

    protected $fillable = ['s3_key', 'score'];
}
