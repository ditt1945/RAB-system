<?php

namespace App\Jobs;

use App\Models\AiRequest;
use App\Services\GeminiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateRabItems implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public AiRequest $aiRequest;

    /**
     * Create a new job instance.
     */
    public function __construct(AiRequest $aiRequest)
    {
        $this->aiRequest = $aiRequest;
    }

    /**
     * Execute the job.
     */
    public function handle(GeminiService $gemini): void
    {
        $this->aiRequest->update(['status' => 'processing']);

        try {
            $materials = \App\Models\Material::orderBy('name')
                ->limit(80)
                ->get(['name', 'category', 'unit', 'unit_price', 'supplier'])
                ->toArray();

            $items = $gemini->generateRabItems($this->aiRequest->project, $this->aiRequest->prompt, $materials);

            $this->aiRequest->update([
                'suggestions' => $items,
                'status' => 'completed',
            ]);
        } catch (\Throwable $exception) {
            $this->aiRequest->update([
                'status' => 'failed',
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
