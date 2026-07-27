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
        Schema::create('house_estimations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('house_type');
            $table->decimal('floor_area', 10, 2);
            $table->decimal('land_area', 10, 2)->nullable();
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->string('quality')->default('standar'); // hemat, standar, premium
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->json('additional_features')->nullable();
            $table->decimal('total_estimate', 15, 2);
            $table->json('breakdown')->nullable();
            $table->text('summary')->nullable();
            $table->string('status')->default('completed'); // pending, completed, archived
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('house_estimations');
    }
};
