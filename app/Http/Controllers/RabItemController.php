<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\RabItem;
use App\Models\Material;
use App\Models\ChangeOrder;
use App\Models\RabRevision;
use App\Services\RabSummaryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RabItemController extends Controller
{
    public function __construct(private RabSummaryService $rabSummary)
    {
    }

    private function getRabItems(Project $project)
    {
        return $project->rabItems()
            ->with('material')
            ->orderBy('group_name')
            ->latest()
            ->get();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Project $project)
    {
        $this->authorizeProjectAccess($project);

        $rabItems = $this->getRabItems($project);
        $summary = $this->rabSummary->build($project, $rabItems);
        $materials = Material::orderBy('name')->get();

        return Inertia::render('RabItems/Index', [
            'project' => $project,
            'rabItems' => $rabItems,
            'materials' => $materials,
            'summary' => $summary,
            'revisions' => $project->rabRevisions()
                ->with('user:id,name')
                ->latest()
                ->limit(6)
                ->get(),
            'changeOrders' => $project->changeOrders()
                ->with('user:id,name')
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }

    /**
     * Display assisted review tools for the project RAB.
     */
    public function ai(Project $project)
    {
        $this->authorizeProjectAccess($project);

        $rabItems = $this->getRabItems($project);
        $materials = Material::orderBy('name')->get();

        $aiRequest = \App\Models\AiRequest::where('project_id', $project->id)
            ->where('user_id', auth()->id())
            ->orderByRaw("CASE WHEN status = 'completed' THEN 0 WHEN status in ('pending', 'processing') THEN 1 ELSE 2 END")
            ->latest()
            ->first();

        return Inertia::render('RabItems/Ai', [
            'project' => $project,
            'rabItems' => $rabItems,
            'materials' => $materials,
            'summary' => $this->rabSummary->build($project, $rabItems),
            'aiRequest' => $aiRequest,
            'aiInsights' => $this->buildAiInsights($rabItems, $materials),
        ]);
    }

    /**
     * Display a print-friendly RAB page.
     */
    public function print(Project $project)
    {
        $this->authorizeProjectAccess($project);

        $rabItems = $this->getRabItems($project);

        return Inertia::render('RabItems/Print', [
            'project' => $project,
            'rabItems' => $rabItems,
            'summary' => $this->rabSummary->build($project, $rabItems),
        ]);
    }

    /**
     * Export RAB data as an Excel-compatible CSV file.
     */
    public function exportCsv(Project $project)
    {
        $this->authorizeProjectAccess($project);

        $rabItems = $this->getRabItems($project);
        $summary = $this->rabSummary->build($project, $rabItems);
        $filename = 'rab-'.$project->id.'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($project, $rabItems, $summary) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Project', $project->project_name]);
            fputcsv($handle, ['Client', $project->client_name]);
            fputcsv($handle, []);
            fputcsv($handle, [
                'Group',
                'Name',
                'Material',
                'Category',
                'Volume',
                'Unit',
                'Unit Price',
                'Subtotal',
            ]);

            foreach ($rabItems as $item) {
                fputcsv($handle, [
                    $item->group_name ?: 'Ungrouped',
                    $item->name,
                    $item->material?->name ?: '',
                    $item->category,
                    $item->volume,
                    $item->unit,
                    $item->unit_price,
                    $item->subtotal,
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Subtotal', $summary['subtotal']]);
            fputcsv($handle, ['Discount', $summary['discount']]);
            fputcsv($handle, ['PPN '.$summary['tax_percent'].'%', $summary['tax_amount']]);
            fputcsv($handle, ['Service Fee', $summary['service_fee']]);
            fputcsv($handle, ['Grand Total', $summary['grand_total']]);

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $request->validate([
            'name' => 'required|string|max:255',
            'material_id' => 'nullable|exists:materials,id',
            'group_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'volume' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|max:255',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $material = $request->material_id
            ? Material::findOrFail($request->material_id)
            : null;

        $unitPrice = $request->unit_price;
        $subtotal = $request->volume * $request->unit_price;

        RabItem::create([
            'project_id' => $project->id,
            'material_id' => $material?->id,
            'group_name' => $request->group_name,
            'name' => $request->name ?: $material?->name,
            'category' => $request->category ?: $material?->category,
            'volume' => $request->volume,
            'unit' => $request->unit ?: $material?->unit,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project, RabItem $rabItem)
    {
        $this->authorizeProjectAccess($project);

        if ($rabItem->project_id !== $project->id) {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'material_id' => 'nullable|exists:materials,id',
            'group_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'volume' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|max:255',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $material = $request->material_id
            ? Material::findOrFail($request->material_id)
            : null;

        $unitPrice = $request->unit_price;
        $subtotal = $request->volume * $unitPrice;

        $rabItem->update([
            'material_id' => $material?->id,
            'group_name' => $request->group_name,
            'name' => $request->name ?: $material?->name,
            'category' => $request->category ?: $material?->category,
            'volume' => $request->volume,
            'unit' => $request->unit ?: $material?->unit,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);

        return redirect()->back();
    }

    /**
     * Update the project RAB summary settings.
     */
    public function updateSummary(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'rab_discount' => 'required|numeric|min:0',
            'rab_tax_percent' => 'required|numeric|min:0',
            'rab_service_fee' => 'required|numeric|min:0',
            'target_margin_percent' => 'required|numeric|min:0|max:100',
        ]);

        $project->update($validated);

        return redirect()->back();
    }

    public function storeRevision(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'label' => 'required|string|max:120',
            'notes' => 'nullable|string|max:1000',
        ]);

        $rabItems = $this->getRabItems($project);
        $summary = $this->rabSummary->build($project, $rabItems);

        RabRevision::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'label' => $validated['label'],
            'notes' => $validated['notes'] ?? null,
            'snapshot' => [
                'project' => $project->only([
                    'project_name',
                    'client_name',
                    'rab_discount',
                    'rab_tax_percent',
                    'rab_service_fee',
                    'target_margin_percent',
                ]),
                'items' => $rabItems->map(fn ($item) => $item->only([
                    'group_name',
                    'name',
                    'category',
                    'volume',
                    'unit',
                    'unit_price',
                    'subtotal',
                ]))->values()->all(),
                'summary' => $summary,
            ],
            'subtotal' => $summary['subtotal'],
            'grand_total' => $summary['grand_total'],
        ]);

        return redirect()->back();
    }

    public function storeChangeOrder(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'required|numeric',
            'status' => 'required|in:draft,submitted,approved,rejected',
            'requested_at' => 'nullable|date',
        ]);

        ChangeOrder::create([
            'project_id' => $project->id,
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'amount' => $validated['amount'],
            'status' => $validated['status'],
            'requested_at' => $validated['requested_at'] ?? now()->toDateString(),
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project, RabItem $rabItem)
    {
        $this->authorizeProjectAccess($project);

        if ($rabItem->project_id !== $project->id) {
            abort(404);
        }

        $rabItem->delete();

        return redirect()->back();
    }

    private function authorizeProjectAccess(Project $project): void
    {
        abort_unless($project->isVisibleTo(auth()->user()), 403);
    }

    private function buildAiInsights($rabItems, $materials): array
    {
        $itemCount = $rabItems->count();
        $subtotal = (float) $rabItems->sum('subtotal');
        $missingPrices = $rabItems->filter(fn ($item) => (float) $item->unit_price <= 0)->count();
        $missingGroups = $rabItems->filter(fn ($item) => blank($item->group_name))->count();
        $withoutMaterial = $rabItems->filter(fn ($item) => blank($item->material_id))->count();
        $groupCount = $rabItems->pluck('group_name')->filter()->unique()->count();

        $score = 100;
        $score -= $itemCount === 0 ? 45 : 0;
        $score -= $materials->isEmpty() ? 20 : 0;
        $score -= $missingPrices > 0 ? min(20, $missingPrices * 5) : 0;
        $score -= $missingGroups > 0 ? min(15, $missingGroups * 3) : 0;
        $score -= $withoutMaterial > 0 && $itemCount > 0 ? min(15, $withoutMaterial * 2) : 0;
        $score = max(0, min(100, $score));

        $priorityActions = collect();

        if ($itemCount === 0) {
            $priorityActions->push('Buat draft awal dari scope proyek agar estimator punya baseline item pekerjaan.');
        }

        if ($materials->isEmpty()) {
            $priorityActions->push('Tambahkan database material agar estimasi memakai harga internal, bukan hanya perkiraan pasar.');
        }

        if ($missingGroups > 0) {
            $priorityActions->push("Rapikan {$missingGroups} item tanpa grup pekerjaan supaya audit biaya lebih mudah dibaca.");
        }

        if ($withoutMaterial > 0) {
            $priorityActions->push("Hubungkan {$withoutMaterial} item ke material jika tersedia untuk validasi harga satuan.");
        }

        if ($missingPrices > 0) {
            $priorityActions->push("Lengkapi {$missingPrices} item dengan harga satuan sebelum menghitung margin.");
        }

        if ($priorityActions->isEmpty()) {
            $priorityActions->push('RAB siap diaudit: fokus cek item mahal, margin, dan alternatif material.');
        }

        return [
            'readiness_score' => $score,
            'item_count' => $itemCount,
            'group_count' => $groupCount,
            'material_count' => $materials->count(),
            'missing_prices' => $missingPrices,
            'missing_groups' => $missingGroups,
            'without_material' => $withoutMaterial,
            'subtotal' => $subtotal,
            'top_cost_items' => $rabItems
                ->sortByDesc('subtotal')
                ->take(5)
                ->map(fn ($item) => [
                    'name' => $item->name,
                    'group_name' => $item->group_name,
                    'subtotal' => (float) $item->subtotal,
                ])
                ->values()
                ->all(),
            'priority_actions' => $priorityActions->take(4)->values()->all(),
        ];
    }
}
