<?php

namespace App\Http\Controllers;

use App\Models\HouseEstimation;
use App\Models\QuotationRequest;
use App\Services\GeminiService;
use App\Services\AnalyticsService;
use App\Services\RecommendationEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HouseEstimateController extends Controller
{
    public function __construct(
        private GeminiService $geminiService,
        private AnalyticsService $analyticsService,
        private RecommendationEngine $recommendationEngine
    ) {
    }

    public function index(Request $request)
    {
        $estimation = null;
        if ($request->estimationId && auth()->check()) {
            $estimation = HouseEstimation::where('id', $request->estimationId)
                ->where('user_id', auth()->id())
                ->first();
        }

        return Inertia::render('HouseEstimate', [
            'estimate' => null,
            'estimation' => $estimation,
            'form' => $estimation ? [
                'house_type' => $estimation->house_type,
                'floor_area' => $estimation->floor_area,
                'land_area' => $estimation->land_area,
                'bedrooms' => $estimation->bedrooms,
                'bathrooms' => $estimation->bathrooms,
                'quality' => $estimation->quality,
                'location' => $estimation->location,
                'notes' => $estimation->notes,
                'additional_features' => $estimation->additional_features ?? [],
            ] : [
                'house_type' => $request->house_type ?? '',
                'floor_area' => $request->floor_area ?? '',
                'land_area' => $request->land_area ?? '',
                'bedrooms' => $request->bedrooms ?? '',
                'bathrooms' => $request->bathrooms ?? '',
                'quality' => $request->quality ?? 'standar',
                'location' => $request->location ?? '',
                'notes' => $request->notes ?? '',
                'additional_features' => $request->additional_features ?? [],
            ],
        ]);
    }

    public function packages()
    {
        return Inertia::render('HousePackages');
    }

    public function quotation(Request $request)
    {
        return Inertia::render('HouseQuotation', [
            'estimate_data' => $request->all(),
        ]);
    }

    public function storeQuotation(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'location' => 'required|string|max:255',
            'message' => 'nullable|string|max:1000',
        ]);

        $quotation = QuotationRequest::create($validated);

        // TODO: Send email notification to admin with quotation details
        // TODO: Send confirmation email to customer

        return redirect()->route('house.quotation.success', ['id' => $quotation->id]);
    }

    public function quotationSuccess($id)
    {
        $quotation = QuotationRequest::findOrFail($id);
        return Inertia::render('HouseQuotationSuccess', [
            'quotation' => $quotation,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'house_type' => 'required|string|max:255',
            'floor_area' => 'required|numeric|min:1',
            'land_area' => 'nullable|numeric|min:1',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'quality' => 'required|in:hemat,standar,premium',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'additional_features' => 'nullable|array',
            'additional_features.*' => 'in:carport,pagar,taman,rooftop,kanopi',
        ]);

        $estimate = $this->geminiService->estimateHouse([
            'house_type' => $validated['house_type'],
            'floor_area' => $validated['floor_area'],
            'land_area' => $validated['land_area'] ?? null,
            'bedrooms' => $validated['bedrooms'],
            'bathrooms' => $validated['bathrooms'],
            'quality' => $validated['quality'],
            'location' => $validated['location'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'additional_features' => $validated['additional_features'] ?? [],
        ]);

        // Save estimation if user is authenticated
        if (auth()->check()) {
            $houseEstimation = HouseEstimation::create([
                'user_id' => auth()->id(),
                'house_type' => $validated['house_type'],
                'floor_area' => $validated['floor_area'],
                'land_area' => $validated['land_area'],
                'bedrooms' => $validated['bedrooms'],
                'bathrooms' => $validated['bathrooms'],
                'quality' => $validated['quality'],
                'location' => $validated['location'],
                'notes' => $validated['notes'],
                'additional_features' => $validated['additional_features'],
                'total_estimate' => $estimate['total_estimate'],
                'breakdown' => $estimate['breakdown'],
                'summary' => $estimate['summary'],
                'title' => "{$validated['house_type']} - {$validated['floor_area']}m² ({$validated['quality']})",
            ]);
            $estimate['estimation_id'] = $houseEstimation->id;

            // Update analytics
            $this->analyticsService->updateUserAnalytics(auth()->user());
        }

        return Inertia::render('HouseEstimate', [
            'estimate' => array_merge($estimate, [
                'quality' => $validated['quality'],
                'additional_features' => $validated['additional_features'] ?? [],
            ]),
            'form' => $validated,
        ]);
    }

    public function history(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $estimations = $user->houseEstimations()
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('HouseEstimationHistory', [
            'estimations' => $estimations,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('login');
        }

        $analytics = $this->analyticsService->getUserAnalytics($user);
        $trends = $this->analyticsService->getUserTrends($user);
        $recommendations = $this->recommendationEngine->getRecommendations($user);

        return Inertia::render('HouseEstimationDashboard', [
            'analytics' => $analytics,
            'trends' => $trends,
            'recommendations' => $recommendations,
        ]);
    }

    public function deleteEstimation($id)
    {
        $estimation = HouseEstimation::findOrFail($id);

        if ($estimation->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $estimation->delete();

        // Recalculate analytics
        $this->analyticsService->updateUserAnalytics(auth()->user());

        return redirect()->route('house.estimations.history')
            ->with('success', 'Estimasi berhasil dihapus');
    }
}
