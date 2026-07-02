<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => User::factory()->definition()['password'] ?? null]
        );

        if (! $user->hasRole('admin')) {
            $user->assignRole('admin');
        }

        // sample materials
        \App\Models\Material::create(["name" => "Cement", "category" => "Material", "unit" => "bag", "unit_price" => 90000]);
        \App\Models\Material::create(["name" => "Sand", "category" => "Material", "unit" => "m3", "unit_price" => 250000]);
        \App\Models\Material::create(["name" => "Brick", "category" => "Material", "unit" => "pcs", "unit_price" => 1500]);

        // sample project with a couple of rab items
        $project = \App\Models\Project::create([
            'project_name' => 'Sample House 2L',
            'client_name' => 'PT. Contoh',
            'description' => 'Proyek contoh untuk demo sistem RAB',
            'created_by' => $user->id,
        ]);

        \App\Models\RabItem::create([
            'project_id' => $project->id,
            'name' => 'Foundation Excavation',
            'category' => 'Excavation',
            'volume' => 10,
            'unit' => 'm3',
            'unit_price' => 50000,
            'subtotal' => 10 * 50000,
        ]);

        \App\Models\RabItem::create([
            'project_id' => $project->id,
            'name' => 'Concrete Footing',
            'category' => 'Concrete',
            'volume' => 5,
            'unit' => 'm3',
            'unit_price' => 750000,
            'subtotal' => 5 * 750000,
        ]);
    }
}
