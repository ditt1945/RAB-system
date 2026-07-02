<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('ai_requests', 'accepted_at')) {
                $table->timestamp('accepted_at')->nullable()->after('error');
            }

            $table->index(['project_id', 'user_id', 'status']);
            $table->index('accepted_at');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['created_by', 'status']);
            $table->index('project_name');
            $table->index('client_name');
        });

        Schema::table('rab_items', function (Blueprint $table) {
            $table->index(['project_id', 'group_name']);
        });

        Schema::table('materials', function (Blueprint $table) {
            $table->index('name');
            $table->index('category');
            $table->index('supplier');
        });
    }

    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['category']);
            $table->dropIndex(['supplier']);
        });

        Schema::table('rab_items', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'group_name']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['created_by', 'status']);
            $table->dropIndex(['project_name']);
            $table->dropIndex(['client_name']);
        });

        Schema::table('ai_requests', function (Blueprint $table) {
            $table->dropIndex(['project_id', 'user_id', 'status']);
            $table->dropIndex(['accepted_at']);

            if (Schema::hasColumn('ai_requests', 'accepted_at')) {
                $table->dropColumn('accepted_at');
            }
        });
    }
};
