<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RabItemController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\AiRabController;
use App\Models\AiRequest;
use App\Models\Material;
use App\Models\Project;
use App\Models\RabItem;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/house-estimate', [\App\Http\Controllers\HouseEstimateController::class, 'index'])
    ->name('house.estimate.index');

Route::post('/house-estimate', [\App\Http\Controllers\HouseEstimateController::class, 'store'])
    ->name('house.estimate.store');

Route::get('/house-packages', [\App\Http\Controllers\HouseEstimateController::class, 'packages'])
    ->name('house.packages');

Route::get('/house-quotation', [\App\Http\Controllers\HouseEstimateController::class, 'quotation'])
    ->name('house.quotation');

Route::post('/house-quotation', [\App\Http\Controllers\HouseEstimateController::class, 'storeQuotation'])
    ->name('house.quotation.store');

Route::get('/house-quotation/success/{id}', [\App\Http\Controllers\HouseEstimateController::class, 'quotationSuccess'])
    ->name('house.quotation.success');

Route::middleware('auth')->group(function () {
    Route::get('/house-estimations', [\App\Http\Controllers\HouseEstimateController::class, 'history'])
        ->name('house.estimations.history');
    Route::delete('/house-estimations/{id}', [\App\Http\Controllers\HouseEstimateController::class, 'deleteEstimation'])
        ->name('house.estimations.delete');
    Route::get('/house-dashboard', [\App\Http\Controllers\HouseEstimateController::class, 'dashboard'])
        ->name('house.dashboard');
});

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    $projectQuery = Project::query()->visibleTo($user);
    $subtotal = RabItem::whereHas('project', fn ($query) => $query->visibleTo($user))->sum('subtotal');

    return Inertia::render('Dashboard', [
        'stats' => [
            'projects' => (clone $projectQuery)->count(),
            'activeProjects' => (clone $projectQuery)->where('status', 'progress')->count(),
            'completedProjects' => (clone $projectQuery)->where('status', 'completed')->count(),
            'planningProjects' => (clone $projectQuery)->where('status', 'planning')->count(),
            'cancelledProjects' => (clone $projectQuery)->where('status', 'cancelled')->count(),
            'materials' => Material::count(),
            'rabSubtotal' => $subtotal,
            'averageRab' => (clone $projectQuery)->count() > 0 ? round($subtotal / (clone $projectQuery)->count()) : 0,
            'rabItems' => RabItem::whereHas('project', fn ($query) => $query->visibleTo($user))->count(),
            'aiRequests' => AiRequest::whereHas('project', fn ($query) => $query->visibleTo($user))->count(),
        ],
        'recentProjects' => Project::query()
            ->visibleTo($user)
            ->withCount('rabItems')
            ->withSum('rabItems', 'subtotal')
            ->latest()
            ->limit(5)
            ->get(['id', 'project_name', 'client_name', 'status', 'start_date', 'created_at']),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin-test', function () {
        return 'Admin Only';
    });

    // Admin user management
    Route::resource('users', \App\Http\Controllers\UserController::class)->only(['index', 'update', 'destroy']);

    Route::resource('materials', MaterialController::class)
        ->except(['show']);

});

/*
|--------------------------------------------------------------------------
| AUTHENTICATED USER ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');

    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    Route::delete('/profile', [ProfileController::class, 'destroy'])
        ->name('profile.destroy');

    /*
    |--------------------------------------------------------------------------
    | PROJECTS
    |--------------------------------------------------------------------------
    */

    Route::resource('projects', ProjectController::class);

    Route::get(
        '/projects/{project}/rab',
        [RabItemController::class, 'index']
    )->name('rab.index');

    Route::get(
        '/projects/{project}/rab/ai',
        [RabItemController::class, 'ai']
    )->name('rab.ai');

    Route::post(
        '/projects/{project}/rab',
        [RabItemController::class, 'store']
    )->name('rab.store');

    Route::post(
        '/projects/{project}/rab/ai-generate',
        [AiRabController::class, 'generate']
    )->middleware('throttle:10,1')->name('rab.ai.generate');

    Route::post(
        '/projects/{project}/rab/ai-accept',
        [AiRabController::class, 'accept']
    )->name('rab.ai.accept');

    Route::post(
        '/projects/{project}/rab/ai-analyze',
        [AiRabController::class, 'analyze']
    )->middleware('throttle:10,1')->name('rab.ai.analyze');

    Route::post(
        '/projects/{project}/rab/ai-assistant',
        [AiRabController::class, 'assistant']
    )->middleware('throttle:10,1')->name('rab.ai.assistant');

    Route::patch(
        '/projects/{project}/rab/summary',
        [RabItemController::class, 'updateSummary']
    )->name('rab.summary.update');

    Route::post(
        '/projects/{project}/rab/revisions',
        [RabItemController::class, 'storeRevision']
    )->name('rab.revisions.store');

    Route::post(
        '/projects/{project}/rab/change-orders',
        [RabItemController::class, 'storeChangeOrder']
    )->name('rab.change-orders.store');

    Route::get(
        '/projects/{project}/rab/print',
        [RabItemController::class, 'print']
    )->name('rab.print');

    Route::get(
        '/projects/{project}/rab/export-csv',
        [RabItemController::class, 'exportCsv']
    )->name('rab.export.csv');

    Route::put(
        '/projects/{project}/rab/{rabItem}',
        [RabItemController::class, 'update']
    )->name('rab.update');

    Route::delete(
        '/projects/{project}/rab/{rabItem}',
        [RabItemController::class, 'destroy']
    )->name('rab.destroy');

});

require __DIR__.'/auth.php';

Route::fallback(function () {
    return response()->view('errors.404', [], 404);
});
