<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Project;
use App\Models\RabItem;
use App\Models\AiRequest;
use App\Jobs\GenerateRabItems;
use App\Services\GeminiService;
use App\Services\RabSummaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AiRabController extends Controller
{
    public function __construct(private RabSummaryService $rabSummary)
    {
    }

    /**
     * Generate draft RAB items and save the request for review.
     */
    public function generate(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'ai_prompt' => 'required|string|min:10|max:5000',
        ]);

        $aiRequest = AiRequest::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'prompt' => $validated['ai_prompt'],
            'status' => 'processing',
        ]);

        if (app()->environment('local')) {
            GenerateRabItems::dispatchSync($aiRequest);

            $aiRequest->refresh();

            return redirect()
                ->route('rab.ai', $project->id)
                ->with(
                    $aiRequest->status === 'completed' ? 'success' : 'error',
                    $aiRequest->status === 'completed'
                        ? 'Draft selesai dibuat. Silakan review sebelum dimasukkan ke RAB.'
                        : ($aiRequest->error ?: 'Draft belum berhasil dibuat. Coba periksa koneksi atau konfigurasi layanan.'),
                );
        }

        GenerateRabItems::dispatch($aiRequest);

        return redirect()
            ->route('rab.ai', $project->id)
            ->with('success', 'Draft masuk antrean. Refresh halaman ini untuk melihat status terbaru.');
    }

    /**
     * Accept draft suggestions and persist them into the project's RAB.
     */
    public function accept(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'ai_request_id' => 'nullable|exists:ai_requests,id',
        ]);

        $aiRequestQuery = AiRequest::where('project_id', $project->id)
            ->where('user_id', auth()->id())
            ->where('status', 'completed');

        if (! empty($validated['ai_request_id'])) {
            $aiRequestQuery->where('id', $validated['ai_request_id']);
        } else {
            $aiRequestQuery->whereNull('accepted_at')->latest();
        }

        $aiRequest = $aiRequestQuery->firstOrFail();

        $items = $aiRequest->suggestions ?: [];

        $createdCount = DB::transaction(function () use ($aiRequest, $items, $project) {
            $createdCount = 0;

            foreach ($items as $item) {
                $material = ! empty($item['material'])
                    ? Material::where('name', $item['material'])->first()
                    : null;

                $volume = max((float) ($item['volume'] ?? 0), 0);
                $unitPrice = max((float) ($item['unit_price'] ?? 0), 0);

                if ($volume <= 0) {
                    continue;
                }

                $attributes = [
                    'project_id' => $project->id,
                    'material_id' => $material?->id,
                    'group_name' => $item['group_name'] ?? null,
                    'name' => $item['name'] ?? ($material?->name ?? 'Unnamed'),
                    'category' => $item['category'] ?? $material?->category,
                    'volume' => $volume,
                    'unit' => $item['unit'] ?? $material?->unit,
                    'unit_price' => $unitPrice,
                    'subtotal' => $volume * $unitPrice,
                ];

                $alreadyExists = RabItem::where('project_id', $project->id)
                    ->where('group_name', $attributes['group_name'])
                    ->where('name', $attributes['name'])
                    ->where('volume', $attributes['volume'])
                    ->where('unit_price', $attributes['unit_price'])
                    ->exists();

                if ($alreadyExists) {
                    continue;
                }

                RabItem::create($attributes);

                $createdCount++;
            }

            if ($createdCount > 0 && ! $aiRequest->accepted_at) {
                $aiRequest->update(['accepted_at' => now()]);
            }

            return $createdCount;
        });

        if ($createdCount === 0) {
            $hasValidItems = collect($items)
                ->contains(fn ($item) => max((float) ($item['volume'] ?? 0), 0) > 0);

            if ($hasValidItems) {
                return redirect()
                    ->route('rab.index', $project->id)
                    ->with('success', 'Draft ini sudah tersinkron ke RAB.');
            }

            return redirect()
                ->route('rab.ai', $project->id)
                ->with('error', 'Draft AI belum punya item dengan volume valid, jadi belum bisa dimasukkan ke RAB.');
        }

        return redirect()->route('rab.index', $project->id)->with('success', 'Draft berhasil dimasukkan ke RAB.');
    }

    /**
     * Analyze the current project RAB.
     */
    public function analyze(Project $project, GeminiService $gemini)
    {
        $this->authorizeProjectAccess($project);

        $rabItems = $project->rabItems()
            ->with('material')
            ->orderBy('group_name')
            ->latest()
            ->get();

        if ($rabItems->isEmpty()) {
            return redirect()
                ->back()
                ->withErrors(['ai_analysis' => 'Tambahkan item RAB dulu sebelum analisa biaya.']);
        }

        $items = $rabItems
            ->map(fn ($item) => [
                'group_name' => $item->group_name,
                'name' => $item->name,
                'material' => $item->material?->name,
                'category' => $item->category,
                'volume' => $item->volume,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ])
            ->values()
            ->all();

        $summary = $this->rabSummary->build($project, $rabItems);

        try {
            $analysis = $gemini->analyzeRab($project, $items, $summary);
        } catch (RuntimeException $exception) {
            return redirect()
                ->back()
                ->withErrors(['ai_analysis' => $exception->getMessage()]);
        }

        return redirect()
            ->back()
            ->with('ai_analysis', $analysis);
    }

    /**
     * Answer a contractor review question.
     */
    public function assistant(Request $request, Project $project, GeminiService $gemini)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'assistant_question' => 'required|string|min:5|max:2000',
        ]);

        $rabItems = $project->rabItems()
            ->with('material')
            ->orderBy('group_name')
            ->latest()
            ->get();

        $items = $rabItems
            ->map(fn ($item) => [
                'group_name' => $item->group_name,
                'name' => $item->name,
                'material' => $item->material?->name,
                'category' => $item->category,
                'volume' => $item->volume,
                'unit' => $item->unit,
                'unit_price' => $item->unit_price,
                'subtotal' => $item->subtotal,
            ])
            ->values()
            ->all();

        $materials = Material::orderBy('name')
            ->get(['name', 'category', 'unit', 'unit_price', 'supplier'])
            ->toArray();

        try {
            $answer = $gemini->answerAssistant(
                $project,
                $validated['assistant_question'],
                $items,
                $this->rabSummary->build($project, $rabItems),
                $materials,
            );
        } catch (RuntimeException $exception) {
            return redirect()
                ->back()
                ->withErrors(['assistant_question' => $exception->getMessage()]);
        }

        return redirect()
            ->back()
            ->with('ai_assistant', $answer);
    }

    private function authorizeProjectAccess(Project $project): void
    {
        abort_unless($project->isVisibleTo(auth()->user()), 403);
    }
}
