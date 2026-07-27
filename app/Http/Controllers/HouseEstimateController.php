<?php

namespace App\Http\Controllers;

use App\Models\QuotationRequest;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HouseEstimateController extends Controller
{
    public function __construct(private GeminiService $geminiService)
    {
    }

    public function index(Request $request)
    {
        return Inertia::render('HouseEstimate', [
            'estimate' => null,
            'form' => [
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

        return Inertia::render('HouseEstimate', [
            'estimate' => array_merge($estimate, [
                'quality' => $validated['quality'],
                'additional_features' => $validated['additional_features'] ?? [],
            ]),
            'form' => $validated,
        ]);
    }
}
