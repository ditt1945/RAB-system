<?php

namespace Tests\Unit;

use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeminiServiceTest extends TestCase
{
    public function test_estimate_house_parses_gemini_response_into_structured_payload(): void
    {
        config(['services.gemini.api_key' => 'test-key']);

        Http::fake([
            '*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                [
                                    'text' => json_encode([
                                        'summary' => 'Estimasi rumah 2 lantai dengan material standar.',
                                        'total_estimate' => 850000000,
                                        'breakdown' => [
                                            ['name' => 'Struktur', 'amount' => 320000000],
                                            ['name' => 'Finishing', 'amount' => 180000000],
                                        ],
                                        'notes' => ['Belum termasuk PPN.'],
                                    ], JSON_UNESCAPED_UNICODE),
                                ],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $service = new GeminiService();
        $result = $service->estimateHouse([
            'house_type' => '2 lantai',
            'floor_area' => 120,
            'bedrooms' => 3,
            'bathrooms' => 2,
            'quality' => 'standar',
            'location' => 'Bandung',
            'notes' => 'Finishing sederhana.',
        ]);

        $this->assertSame('Estimasi rumah 2 lantai dengan material standar.', $result['summary']);
        $this->assertSame(850000000, $result['total_estimate']);
        $this->assertSame('Struktur', $result['breakdown'][0]['name']);
        $this->assertSame(320000000, $result['breakdown'][0]['amount']);
        $this->assertSame(['Belum termasuk PPN.'], $result['notes']);
    }
}
