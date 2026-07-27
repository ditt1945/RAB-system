<?php

namespace Tests\Feature;

use Tests\TestCase;

class HouseEstimateTest extends TestCase
{
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
}
