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
        Schema::create('estimation_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('metric_type'); // avg_cost_per_m2, popular_quality, popular_features, total_estimations, etc
            $table->json('data'); // stores metric-specific data
            $table->integer('count')->default(0);
            $table->decimal('average', 15, 2)->nullable();
            $table->string('period')->default('all'); // all, month, quarter, year
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estimation_analytics');
    }
};
