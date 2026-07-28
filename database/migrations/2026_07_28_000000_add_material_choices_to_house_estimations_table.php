<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('house_estimations', function (Blueprint $table) {
            $table->json('material_choices')->nullable()->after('additional_features');
        });
    }

    public function down(): void
    {
        Schema::table('house_estimations', function (Blueprint $table) {
            $table->dropColumn('material_choices');
        });
    }
};
