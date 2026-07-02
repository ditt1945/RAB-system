<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'target_margin_percent')) {
                $table->decimal('target_margin_percent', 5, 2)->default(15)->after('rab_service_fee');
            }
        });

        Schema::create('rab_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('rab_template_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rab_template_id')->constrained()->cascadeOnDelete();
            $table->string('group_name')->nullable();
            $table->string('name');
            $table->string('category')->nullable();
            $table->decimal('volume', 15, 2)->default(1);
            $table->string('unit')->nullable();
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('rab_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->text('notes')->nullable();
            $table->json('snapshot');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('change_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->date('requested_at')->nullable();
            $table->timestamps();
        });

        $now = now();
        $templates = [
            [
                'name' => 'Rumah Tinggal Standar',
                'category' => 'Residential',
                'description' => 'Struktur dasar untuk pekerjaan rumah tinggal satu lantai.',
                'items' => [
                    ['Persiapan', 'Pembersihan lahan dan direksi keet', 'Preliminaries', 1, 'ls', 0],
                    ['Pekerjaan Tanah', 'Galian pondasi', 'Earthwork', 1, 'm3', 0],
                    ['Struktur', 'Pondasi batu kali', 'Structure', 1, 'm3', 0],
                    ['Struktur', 'Beton sloof dan kolom praktis', 'Structure', 1, 'm3', 0],
                    ['Arsitektur', 'Pasangan dinding bata ringan', 'Architecture', 1, 'm2', 0],
                    ['Finishing', 'Plester aci dan cat dinding', 'Finishing', 1, 'm2', 0],
                ],
            ],
            [
                'name' => 'Renovasi Interior',
                'category' => 'Renovation',
                'description' => 'Template cepat untuk renovasi ruang dan finishing interior.',
                'items' => [
                    ['Persiapan', 'Proteksi area kerja', 'Preliminaries', 1, 'ls', 0],
                    ['Bongkaran', 'Bongkar partisi atau finishing lama', 'Demolition', 1, 'm2', 0],
                    ['Interior', 'Partisi gypsum rangka hollow', 'Interior', 1, 'm2', 0],
                    ['Interior', 'Plafon gypsum', 'Interior', 1, 'm2', 0],
                    ['MEP', 'Instalasi listrik titik lampu/stop kontak', 'MEP', 1, 'titik', 0],
                    ['Finishing', 'Pengecatan interior', 'Finishing', 1, 'm2', 0],
                ],
            ],
            [
                'name' => 'Pekerjaan MEP Ringan',
                'category' => 'MEP',
                'description' => 'Template awal untuk pekerjaan mekanikal, elektrikal, dan plumbing ringan.',
                'items' => [
                    ['Elektrikal', 'Instalasi kabel dan conduit', 'Electrical', 1, 'titik', 0],
                    ['Elektrikal', 'Panel listrik kecil', 'Electrical', 1, 'unit', 0],
                    ['Plumbing', 'Instalasi pipa air bersih', 'Plumbing', 1, 'm', 0],
                    ['Plumbing', 'Instalasi pipa air kotor', 'Plumbing', 1, 'm', 0],
                    ['Testing', 'Testing dan commissioning', 'Commissioning', 1, 'ls', 0],
                ],
            ],
        ];

        foreach ($templates as $template) {
            $templateId = DB::table('rab_templates')->insertGetId([
                'name' => $template['name'],
                'category' => $template['category'],
                'description' => $template['description'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            foreach ($template['items'] as $item) {
                DB::table('rab_template_items')->insert([
                    'rab_template_id' => $templateId,
                    'group_name' => $item[0],
                    'name' => $item[1],
                    'category' => $item[2],
                    'volume' => $item[3],
                    'unit' => $item[4],
                    'unit_price' => $item[5],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('change_orders');
        Schema::dropIfExists('rab_revisions');
        Schema::dropIfExists('rab_template_items');
        Schema::dropIfExists('rab_templates');

        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'target_margin_percent')) {
                $table->dropColumn('target_margin_percent');
            }
        });
    }
};
