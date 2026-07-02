<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MaterialAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
    }

    public function test_regular_user_cannot_manage_materials(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('materials.index'))
            ->assertForbidden();
    }

    public function test_admin_can_manage_materials(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)
            ->get(route('materials.index'))
            ->assertOk();
    }
}
