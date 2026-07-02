<?php

namespace Tests\Feature;

use App\Jobs\GenerateRabItems;
use App\Models\AiRequest;
use App\Models\RabItem;
use App\Models\Project;
use App\Models\User;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AiRabTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'admin']);
    }

    public function test_generate_ai_request_is_queued(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.generate', $project), [
                'ai_prompt' => 'Buatkan RAB renovasi kantor dengan pekerjaan plafon dan cat ulang.',
            ])
            ->assertRedirect(route('rab.ai', $project));

        $aiRequest = AiRequest::first();

        $this->assertSame('processing', $aiRequest->status);
        Queue::assertPushed(GenerateRabItems::class);
    }

    public function test_accept_ai_suggestions_is_idempotent(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Accept Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Draft RAB',
            'status' => 'completed',
            'suggestions' => [
                [
                    'group_name' => 'Persiapan',
                    'name' => 'Pembersihan area',
                    'category' => 'Jasa',
                    'volume' => 1,
                    'unit' => 'ls',
                    'unit_price' => 500000,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [
                'ai_request_id' => $aiRequest->id,
            ])
            ->assertRedirect(route('rab.index', $project));

        $this->assertDatabaseCount('rab_items', 1);
        $this->assertNotNull($aiRequest->refresh()->accepted_at);

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [
                'ai_request_id' => $aiRequest->id,
            ])
            ->assertRedirect(route('rab.index', $project));

        $this->assertDatabaseCount('rab_items', 1);
    }

    public function test_generate_job_marks_request_completed_with_suggestions(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Job Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Buat RAB awal',
            'status' => 'processing',
        ]);

        $gemini = $this->mock(GeminiService::class);
        $gemini->shouldReceive('generateRabItems')
            ->once()
            ->andReturn([
                [
                    'group_name' => 'Persiapan',
                    'name' => 'Mobilisasi',
                    'volume' => 1,
                    'unit' => 'ls',
                    'unit_price' => 1000000,
                ],
            ]);

        (new GenerateRabItems($aiRequest))->handle($gemini);

        $aiRequest->refresh();

        $this->assertSame('completed', $aiRequest->status);
        $this->assertSame('Mobilisasi', $aiRequest->suggestions[0]['name']);
    }

    public function test_generate_job_marks_request_failed_when_service_fails(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Failed Job Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Buat RAB awal',
            'status' => 'processing',
        ]);

        $gemini = $this->mock(GeminiService::class);
        $gemini->shouldReceive('generateRabItems')
            ->once()
            ->andThrow(new \RuntimeException('API key belum diisi'));

        (new GenerateRabItems($aiRequest))->handle($gemini);

        $aiRequest->refresh();

        $this->assertSame('failed', $aiRequest->status);
        $this->assertSame('API key belum diisi', $aiRequest->error);
    }

    public function test_accept_ai_suggestions_calculates_subtotal_and_skips_invalid_volume(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Accept Calculation Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Draft RAB',
            'status' => 'completed',
            'suggestions' => [
                [
                    'group_name' => 'Finishing',
                    'name' => 'Cat dinding',
                    'volume' => 12.5,
                    'unit' => 'm2',
                    'unit_price' => 40000,
                ],
                [
                    'group_name' => 'Finishing',
                    'name' => 'Item volume nol',
                    'volume' => 0,
                    'unit' => 'ls',
                    'unit_price' => 999999,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [
                'ai_request_id' => $aiRequest->id,
            ])
            ->assertRedirect(route('rab.index', $project));

        $this->assertDatabaseCount('rab_items', 1);

        $item = RabItem::first();

        $this->assertSame('Cat dinding', $item->name);
        $this->assertEquals(500000, (float) $item->subtotal);
    }

    public function test_accept_ai_suggestions_falls_back_to_latest_completed_draft_when_id_is_missing(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Accept Fallback Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Draft RAB',
            'status' => 'completed',
            'suggestions' => [
                [
                    'group_name' => 'Persiapan',
                    'name' => 'Pembersihan awal',
                    'volume' => 1,
                    'unit' => 'ls',
                    'unit_price' => 350000,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [])
            ->assertRedirect(route('rab.index', $project));

        $this->assertDatabaseHas('rab_items', [
            'project_id' => $project->id,
            'name' => 'Pembersihan awal',
            'subtotal' => 350000,
        ]);
    }

    public function test_accepted_draft_can_be_synced_again_without_duplicates(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'AI Resync Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => $user->id,
            'prompt' => 'Draft RAB',
            'status' => 'completed',
            'accepted_at' => now(),
            'suggestions' => [
                [
                    'group_name' => 'MEP',
                    'name' => 'Instalasi titik lampu',
                    'volume' => 4,
                    'unit' => 'titik',
                    'unit_price' => 125000,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [
                'ai_request_id' => $aiRequest->id,
            ])
            ->assertRedirect(route('rab.index', $project));

        $this->actingAs($user)
            ->post(route('rab.ai.accept', $project), [
                'ai_request_id' => $aiRequest->id,
            ])
            ->assertRedirect(route('rab.index', $project));

        $this->assertDatabaseCount('rab_items', 1);
        $this->assertDatabaseHas('rab_items', [
            'project_id' => $project->id,
            'name' => 'Instalasi titik lampu',
            'subtotal' => 500000,
        ]);
    }

    public function test_ai_analysis_requires_existing_rab_items(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Empty Analysis Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->post(route('rab.ai.analyze', $project))
            ->assertRedirect()
            ->assertSessionHasErrors('ai_analysis');
    }

    public function test_ai_analysis_flashes_service_result(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Analysis Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);
        RabItem::create([
            'project_id' => $project->id,
            'name' => 'Pekerjaan beton',
            'volume' => 1,
            'unit_price' => 2000000,
            'subtotal' => 2000000,
        ]);

        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('analyzeRab')
                ->once()
                ->andReturn([
                    'overview' => 'RAB cukup sehat.',
                    'risk_level' => 'medium',
                    'estimated_margin_percent' => 12,
                    'expensive_items' => [],
                    'saving_recommendations' => ['Cek volume beton.'],
                    'material_recommendations' => [],
                    'profit_notes' => [],
                    'data_gaps' => [],
                    'next_actions' => [],
                ]);
        });

        $this->actingAs($user)
            ->post(route('rab.ai.analyze', $project))
            ->assertRedirect()
            ->assertSessionHas('ai_analysis.overview', 'RAB cukup sehat.');
    }

    public function test_ai_assistant_flashes_answer(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'project_name' => 'Assistant Project',
            'client_name' => 'Client A',
            'created_by' => $user->id,
        ]);

        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('answerAssistant')
                ->once()
                ->andReturn([
                    'question' => 'Apa item paling berisiko?',
                    'answer' => 'Item paling berisiko adalah pekerjaan struktur karena belum detail.',
                    'key_points' => ['Butuh breakdown.'],
                    'recommendations' => ['Tambah detail material.'],
                    'follow_up_actions' => [
                        [
                            'label' => 'Breakdown struktur',
                            'detail' => 'Pisahkan beton, besi, bekisting, dan tenaga.',
                        ],
                    ],
                ]);
        });

        $this->actingAs($user)
            ->post(route('rab.ai.assistant', $project), [
                'assistant_question' => 'Apa item paling berisiko?',
            ])
            ->assertRedirect()
            ->assertSessionHas('ai_assistant.answer', 'Item paling berisiko adalah pekerjaan struktur karena belum detail.');
    }
}
