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
            if (! Schema::hasColumn('rab_items', 'project_id')) {
                $table->foreignId('project_id')
                    ->nullable()
                    ->after('id')
                    ->constrained()
                    ->cascadeOnDelete();
            }

            if (! Schema::hasColumn('rab_items', 'material_id')) {
                $table->foreignId('material_id')
                    ->nullable()
                    ->after('project_id')
                    ->constrained()
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('rab_items', 'name')) {
                $table->string('name')->after('material_id');
            }

            if (! Schema::hasColumn('rab_items', 'category')) {
                $table->string('category')->nullable()->after('name');
            }

            if (! Schema::hasColumn('rab_items', 'volume')) {
                $table->decimal('volume', 15, 2)->default(0)->after('category');
            }

            if (! Schema::hasColumn('rab_items', 'unit')) {
                $table->string('unit')->nullable()->after('volume');
            }

            if (! Schema::hasColumn('rab_items', 'unit_price')) {
                $table->decimal('unit_price', 15, 2)->default(0)->after('unit');
            }

            if (! Schema::hasColumn('rab_items', 'subtotal')) {
                $table->decimal('subtotal', 15, 2)->default(0)->after('unit_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rab_items', function (Blueprint $table) {
            if (Schema::hasColumn('rab_items', 'material_id')) {
                $table->dropConstrainedForeignId('material_id');
            }

            foreach (['subtotal', 'unit_price', 'unit', 'volume', 'category', 'name'] as $column) {
                if (Schema::hasColumn('rab_items', $column)) {
                    $table->dropColumn($column);
                }
            }

            if (Schema::hasColumn('rab_items', 'project_id')) {
                $table->dropConstrainedForeignId('project_id');
            }
        });
    }
};
