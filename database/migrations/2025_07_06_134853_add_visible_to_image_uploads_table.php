<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('image_uploads', function (Blueprint $table) {
            $table->tinyInteger('visible')->default(1)->after('score');
        });

        // 既存のレコードにも1をセット
        DB::table('image_uploads')->update(['visible' => 1]);
    }

    public function down(): void
    {
        Schema::table('image_uploads', function (Blueprint $table) {
            $table->dropColumn('visible');
        });
    }
};