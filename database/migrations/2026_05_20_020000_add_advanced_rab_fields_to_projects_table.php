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
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'rab_discount')) {
                $table->decimal('rab_discount', 15, 2)->default(0)->after('status');
            }

            if (! Schema::hasColumn('projects', 'rab_tax_percent')) {
                $table->decimal('rab_tax_percent', 5, 2)->default(11)->after('rab_discount');
            }

            if (! Schema::hasColumn('projects', 'rab_service_fee')) {
                $table->decimal('rab_service_fee', 15, 2)->default(0)->after('rab_tax_percent');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            foreach (['rab_service_fee', 'rab_tax_percent', 'rab_discount'] as $column) {
                if (Schema::hasColumn('projects', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
