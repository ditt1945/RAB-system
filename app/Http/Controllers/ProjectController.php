<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\RabItem;
use App\Models\RabTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projects = Project::query()
            ->visibleTo($request->user())
            ->withCount('rabItems')
            ->withSum('rabItems', 'subtotal')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('project_name', 'like', "%{$search}%")
                        ->orWhere('client_name', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only('search'),
            'stats' => [
                'total' => Project::query()->visibleTo($request->user())->count(),
                'planning' => Project::query()->visibleTo($request->user())->where('status', 'planning')->count(),
                'progress' => Project::query()->visibleTo($request->user())->where('status', 'progress')->count(),
                'completed' => Project::query()->visibleTo($request->user())->where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Projects/Create', [
            'templates' => RabTemplate::withCount('items')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|in:planning,progress,completed,cancelled',
            'target_margin_percent' => 'nullable|numeric|min:0|max:100',
            'template_id' => 'nullable|exists:rab_templates,id',
        ]);

        $project = Project::create([
            'project_name' => $validated['project_name'],
            'client_name' => $validated['client_name'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'status' => $validated['status'] ?? 'planning',
            'target_margin_percent' => $validated['target_margin_percent'] ?? 15,
            'created_by' => auth()->id(),
        ]);

        if (! empty($validated['template_id'])) {
            $template = RabTemplate::with('items')->findOrFail($validated['template_id']);

            foreach ($template->items as $item) {
                RabItem::create([
                    'project_id' => $project->id,
                    'group_name' => $item->group_name,
                    'name' => $item->name,
                    'category' => $item->category,
                    'volume' => $item->volume,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->volume * $item->unit_price,
                ]);
            }
        }

        return redirect()->route('rab.index', $project);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $this->authorizeProjectAccess($project);

        return Inertia::render('Projects/Show', [
            'project' => $project->loadCount('rabItems')->loadSum('rabItems', 'subtotal'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        $this->authorizeProjectAccess($project);

        return Inertia::render('Projects/Edit', [
            'project' => $project
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'required|in:planning,progress,completed,cancelled',
            'target_margin_percent' => 'nullable|numeric|min:0|max:100',
        ]);

        $project->update([
            'project_name' => $validated['project_name'],
            'client_name' => $validated['client_name'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'status' => $validated['status'],
            'target_margin_percent' => $validated['target_margin_percent'] ?? $project->target_margin_percent,
        ]);

        return redirect()->route('projects.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $this->authorizeProjectAccess($project);

        $project->delete();

        return redirect()->route('projects.index');
    }

    private function authorizeProjectAccess(Project $project): void
    {
        abort_unless($project->isVisibleTo(auth()->user()), 403);
    }
}
