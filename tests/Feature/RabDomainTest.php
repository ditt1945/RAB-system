<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Project;
use App\Models\ChangeOrder;
use App\Models\RabItem;
use App\Models\RabRevision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RabDomainTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
    }

    public function test_user_cannot_access_another_users_project_rab(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Private Project',
            'client_name' => 'Client A',
            'created_by' => $owner->id,
        ]);

        $this->actingAs($otherUser)
            ->get(route('rab.index', $project))
            ->assertForbidden();
    }

    public function test_admin_can_access_any_project_rab(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $project = Project::create([
            'project_name' => 'Admin Visible Project',
            'client_name' => 'Client A',
            'created_by' => $owner->id,
        ]);

        $this->actingAs($admin)
            ->get(route('rab.index', $project))
            ->assertOk();
    }

    public function test_rab_summary_is_calculated_consistently(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Summary Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
            'rab_discount' => 100000,
            'rab_tax_percent' => 11,
            'rab_service_fee' => 50000,
        ]);

        RabItem::create([
            'project_id' => $project->id,
            'name' => 'Pekerjaan A',
            'volume' => 2,
            'unit_price' => 250000,
            'subtotal' => 500000,
        ]);

        RabItem::create([
            'project_id' => $project->id,
            'name' => 'Pekerjaan B',
            'volume' => 1,
            'unit_price' => 300000,
            'subtotal' => 300000,
        ]);

        $this->actingAs($user)
            ->get(route('rab.index', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->component('RabItems/Index')
                ->where('summary.subtotal', 800000)
                ->where('summary.discount', 100000)
                ->where('summary.tax_percent', 11)
                ->where('summary.tax_amount', 77000)
                ->where('summary.service_fee', 50000)
                ->where('summary.grand_total', 827000)
            );
    }

    public function test_rab_item_crud_recalculates_subtotal_on_server(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'CRUD Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        $material = Material::create([
            'name' => 'Semen',
            'unit' => 'sak',
            'unit_price' => 90000,
        ]);

        $this->actingAs($user)
            ->post(route('rab.store', $project), [
                'material_id' => $material->id,
                'group_name' => 'Persiapan',
                'name' => 'Semen Manual',
                'category' => 'Material',
                'volume' => 3,
                'unit' => 'sak',
                'unit_price' => 100000,
            ])
            ->assertRedirect();

        $item = RabItem::first();
        $this->assertSame('Semen Manual', $item->name);
        $this->assertEquals(300000, (float) $item->subtotal);

        $this->actingAs($user)
            ->put(route('rab.update', [$project, $item]), [
                'material_id' => '',
                'group_name' => 'Persiapan',
                'name' => 'Semen Update',
                'category' => 'Material',
                'volume' => 4,
                'unit' => 'sak',
                'unit_price' => 125000,
            ])
            ->assertRedirect();

        $this->assertEquals(500000, (float) $item->refresh()->subtotal);

        $this->actingAs($user)
            ->delete(route('rab.destroy', [$project, $item]))
            ->assertRedirect();

        $this->assertDatabaseMissing('rab_items', ['id' => $item->id]);
    }

    public function test_export_csv_is_scoped_to_visible_project(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'CSV Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        RabItem::create([
            'project_id' => $project->id,
            'name' => 'Pekerjaan Export',
            'volume' => 1,
            'unit_price' => 100000,
            'subtotal' => 100000,
        ]);

        $response = $this->actingAs($user)
            ->get(route('rab.export.csv', $project))
            ->assertOk();

        $csv = $response->streamedContent();

        $this->assertStringContainsString('CSV Project', $csv);
        $this->assertStringContainsString('Pekerjaan Export', $csv);
    }

    public function test_rab_summary_settings_can_be_updated_and_recalculated(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Summary Settings Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        RabItem::create([
            'project_id' => $project->id,
            'name' => 'Pekerjaan Utama',
            'volume' => 2,
            'unit_price' => 500000,
            'subtotal' => 1000000,
        ]);

        $this->actingAs($user)
            ->patch(route('rab.summary.update', $project), [
                'rab_discount' => 100000,
                'rab_tax_percent' => 11,
                'rab_service_fee' => 25000,
                'target_margin_percent' => 15,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'rab_discount' => 100000,
            'rab_tax_percent' => 11,
            'rab_service_fee' => 25000,
            'target_margin_percent' => 15,
        ]);

        $this->actingAs($user)
            ->get(route('rab.index', $project))
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.subtotal', 1000000)
                ->where('summary.tax_amount', 99000)
                ->where('summary.grand_total', 1024000)
                ->where('summary.target_margin_amount', 135000)
                ->where('summary.estimated_cost', 765000)
            );
    }

    public function test_rab_revision_stores_snapshot_of_current_items_and_summary(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Revision Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
            'rab_tax_percent' => 10,
        ]);

        RabItem::create([
            'project_id' => $project->id,
            'group_name' => 'Finishing',
            'name' => 'Cat dinding',
            'category' => 'Material',
            'volume' => 10,
            'unit' => 'm2',
            'unit_price' => 50000,
            'subtotal' => 500000,
        ]);

        $this->actingAs($user)
            ->post(route('rab.revisions.store', $project), [
                'label' => 'Baseline tender',
                'notes' => 'Siap review internal',
            ])
            ->assertRedirect();

        $revision = RabRevision::first();

        $this->assertSame($project->id, $revision->project_id);
        $this->assertSame($user->id, $revision->user_id);
        $this->assertSame('Baseline tender', $revision->label);
        $this->assertEquals(500000, (float) $revision->subtotal);
        $this->assertEquals(550000, (float) $revision->grand_total);
        $this->assertSame('Cat dinding', $revision->snapshot['items'][0]['name']);
        $this->assertEquals(550000, $revision->snapshot['summary']['grand_total']);
    }

    public function test_change_order_can_be_created_for_visible_project(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Change Order Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->post(route('rab.change-orders.store', $project), [
                'title' => 'Tambah pekerjaan plafon',
                'description' => 'Area ruang meeting tambahan.',
                'amount' => 1750000,
                'status' => 'submitted',
                'requested_at' => '2026-06-05',
            ])
            ->assertRedirect();

        $changeOrder = ChangeOrder::first();

        $this->assertSame($project->id, $changeOrder->project_id);
        $this->assertSame($user->id, $changeOrder->user_id);
        $this->assertSame('submitted', $changeOrder->status);
        $this->assertEquals(1750000, (float) $changeOrder->amount);
        $this->assertSame('2026-06-05', $changeOrder->requested_at->toDateString());
    }

    public function test_user_cannot_mutate_another_users_rab_workflow(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Forbidden Workflow Project',
            'client_name' => 'Client A',
            'created_by' => $owner->id,
        ]);

        $this->actingAs($otherUser)
            ->patch(route('rab.summary.update', $project), [
                'rab_discount' => 0,
                'rab_tax_percent' => 11,
                'rab_service_fee' => 0,
                'target_margin_percent' => 15,
            ])
            ->assertForbidden();

        $this->actingAs($otherUser)
            ->post(route('rab.change-orders.store', $project), [
                'title' => 'Unauthorized change',
                'amount' => 100000,
                'status' => 'draft',
            ])
            ->assertForbidden();
    }
}
