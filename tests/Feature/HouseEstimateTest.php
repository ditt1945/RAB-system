<?php

namespace Tests\Feature;

use App\Models\HouseEstimation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HouseEstimateTest extends TestCase
{
    use RefreshDatabase;

    public function test_house_estimate_page_loads_successfully(): void
    {
        $response = $this->get('/house-estimate');

        $response->assertStatus(200);
    }

    public function test_house_packages_page_loads_successfully(): void
    {
        $response = $this->get('/house-packages');

        $response->assertStatus(200);
    }

    public function test_house_quotation_page_loads_successfully(): void
    {
        $response = $this->get('/house-quotation');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_save_estimate_with_material_choices(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post('/house-estimate', [
                'house_type' => 'Rumah 1 lantai minimalis',
                'floor_area' => 90,
                'land_area' => 120,
                'bedrooms' => 3,
                'bathrooms' => 2,
                'quality' => 'standar',
                'location' => 'Bandung',
                'additional_features' => ['carport', 'taman'],
                'material_choices' => [
                    'wall' => 'bata_ringan',
                    'floor' => 'granite',
                    'frame' => 'aluminium',
                    'paint' => 'weatherproof',
                    'roof' => 'baja_ringan',
                    'sanitary' => 'standar',
                ],
            ]);

        $response->assertStatus(200);

        $estimation = HouseEstimation::query()->where('user_id', $user->id)->first();

        $this->assertNotNull($estimation);
        $this->assertSame('bata_ringan', $estimation->material_choices['wall']);
        $this->assertSame('granite', $estimation->material_choices['floor']);
        $this->assertGreaterThan(0, $estimation->total_estimate);
    }
}
