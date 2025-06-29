<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('image_uploads', function (Blueprint $table) {
            $table->dropColumn('s3_url');
            $table->string('s3_key')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('image_uploads', function (Blueprint $table) {
            $table->dropColumn('s3_key');
            $table->string('s3_url')->after('id');
        });
    }
};
