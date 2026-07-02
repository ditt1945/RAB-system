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
        Schema::table('rab_items', function (Blueprint $table) {
            if (! Schema::hasColumn('rab_items', 'group_name')) {
                $table->string('group_name')->nullable()->after('material_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rab_items', function (Blueprint $table) {
            if (Schema::hasColumn('rab_items', 'group_name')) {
                $table->dropColumn('group_name');
            }
        });
    }
};
