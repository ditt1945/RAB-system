<?php

namespace App\Http\Controllers;

use App\Models\HouseEstimation;
use App\Models\QuotationRequest;
use App\Services\GeminiService;
use App\Services\AnalyticsService;
use App\Services\RecommendationEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

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
                'material_choices' => $estimation->material_choices ?? [],
            ] : [
                'house_type' => $request->house_type ?? '',
                'floor_area' => $request->floor_area ?? '',
                'land_area' => $request->land_area ?? '',
                'bedrooms' => $request->bedrooms ?? '',
                'bathrooms' => $request->bathrooms ?? '',
                'quality' => $request->quality ?? 'standar',
                'location' => $request->location ?? '',
                'notes' => $request->notes ?? '',
                'additional_features' => $this->normalizeFeatures($request->additional_features ?? []),
                'material_choices' => $this->normalizeMaterialChoices($request->material_choices ?? []),
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
            'material_choices' => 'nullable|array',
            'material_choices.wall' => 'nullable|in:bata_merah,bata_ringan,batako',
            'material_choices.floor' => 'nullable|in:keramik,granite,vinyl',
            'material_choices.frame' => 'nullable|in:aluminium,kayu,upvc',
            'material_choices.paint' => 'nullable|in:standar,weatherproof,premium',
            'material_choices.roof' => 'nullable|in:baja_ringan,genteng_beton,genteng_metal',
            'material_choices.sanitary' => 'nullable|in:ekonomis,standar,premium',
        ]);

        $materialChoices = $this->normalizeMaterialChoices($validated['material_choices'] ?? []);

        $houseData = [
            'house_type' => $validated['house_type'],
            'floor_area' => $validated['floor_area'],
            'land_area' => $validated['land_area'] ?? null,
            'bedrooms' => $validated['bedrooms'],
            'bathrooms' => $validated['bathrooms'],
            'quality' => $validated['quality'],
            'location' => $validated['location'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'additional_features' => $validated['additional_features'] ?? [],
            'material_choices' => $materialChoices,
        ];

        try {
            $estimate = $this->geminiService->estimateHouse($houseData);
        } catch (Throwable $exception) {
            report($exception);
            $estimate = $this->estimateHouseLocally($houseData);
        }

        // Save estimation if user is authenticated
        if (auth()->check()) {
            $houseEstimation = HouseEstimation::create([
                'user_id' => auth()->id(),
                'house_type' => $validated['house_type'],
                'floor_area' => $validated['floor_area'],
                'land_area' => $validated['land_area'] ?? null,
                'bedrooms' => $validated['bedrooms'],
                'bathrooms' => $validated['bathrooms'],
                'quality' => $validated['quality'],
                'location' => $validated['location'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'additional_features' => $validated['additional_features'] ?? [],
                'material_choices' => $materialChoices,
                'total_estimate' => $estimate['total_estimate'],
                'breakdown' => $estimate['breakdown'],
                'summary' => $estimate['summary'],
                'title' => "{$validated['house_type']} - {$validated['floor_area']}m2 ({$validated['quality']})",
            ]);
            $estimate['estimation_id'] = $houseEstimation->id;

            // Update analytics
            $this->analyticsService->updateUserAnalytics(auth()->user());
        }

        return Inertia::render('HouseEstimate', [
            'estimate' => array_merge($estimate, [
                'quality' => $validated['quality'],
                'additional_features' => $validated['additional_features'] ?? [],
                'material_choices' => $materialChoices,
            ]),
            'form' => $validated,
        ]);
    }

    private function normalizeFeatures(mixed $features): array
    {
        if (is_array($features)) {
            return array_values(array_filter($features, fn ($feature) => is_string($feature) && $feature !== ''));
        }

        if (is_string($features) && $features !== '') {
            return [$features];
        }

        return [];
    }

    private function normalizeMaterialChoices(mixed $choices): array
    {
        if (! is_array($choices)) {
            return [];
        }

        $allowed = [
            'wall' => ['bata_merah', 'bata_ringan', 'batako'],
            'floor' => ['keramik', 'granite', 'vinyl'],
            'frame' => ['aluminium', 'kayu', 'upvc'],
            'paint' => ['standar', 'weatherproof', 'premium'],
            'roof' => ['baja_ringan', 'genteng_beton', 'genteng_metal'],
            'sanitary' => ['ekonomis', 'standar', 'premium'],
        ];

        return collect($allowed)
            ->mapWithKeys(function (array $values, string $key) use ($choices) {
                $value = $choices[$key] ?? null;

                return in_array($value, $values, true) ? [$key => $value] : [];
            })
            ->all();
    }

    private function estimateHouseLocally(array $houseData): array
    {
        $floorArea = max((float) ($houseData['floor_area'] ?? 0), 1);
        $quality = $houseData['quality'] ?? 'standar';
        $baseRates = [
            'hemat' => 3500000,
            'standar' => 4500000,
            'premium' => 6000000,
        ];
        $featureRates = [
            'carport' => 35000000,
            'pagar' => 28000000,
            'taman' => 18000000,
            'rooftop' => 65000000,
            'kanopi' => 16000000,
        ];

        $baseTotal = $floorArea * ($baseRates[$quality] ?? $baseRates['standar']);
        $featureTotal = collect($houseData['additional_features'] ?? [])
            ->sum(fn ($feature) => $featureRates[$feature] ?? 0);
        $materialMultiplier = 1 + collect($houseData['material_choices'] ?? [])
            ->map(fn ($choice, $group) => $this->materialAdjustment($group, $choice))
            ->sum();
        $roomAdjustment = ((int) ($houseData['bedrooms'] ?? 0) * 3500000)
            + ((int) ($houseData['bathrooms'] ?? 0) * 6500000);
        $locationAdjustment = $houseData['location'] ? $baseTotal * 0.05 : 0;
        $materialAdjustedBase = $baseTotal * $materialMultiplier;
        $total = (int) round($materialAdjustedBase + $featureTotal + $roomAdjustment + $locationAdjustment);

        return [
            'summary' => 'Estimasi awal berdasarkan luas bangunan, paket kualitas, lokasi, jumlah ruang, dan opsi tambahan yang dipilih.',
            'total_estimate' => $total,
            'breakdown' => [
                ['name' => 'Pondasi dan struktur', 'amount' => (int) round($total * 0.30)],
                ['name' => 'Dinding dan atap', 'amount' => (int) round($total * 0.22)],
                ['name' => 'Lantai, plafon, dan finishing', 'amount' => (int) round($total * 0.24)],
                ['name' => 'Instalasi listrik dan air', 'amount' => (int) round($total * 0.12)],
                ['name' => 'Pekerjaan tambahan dan cadangan', 'amount' => (int) round($total * 0.12)],
            ],
            'notes' => [
                'Angka ini estimasi awal, belum termasuk survei kondisi tanah dan detail desain final.',
                'Harga dapat berubah mengikuti spesifikasi material, akses lokasi, dan kondisi lapangan.',
                'Pilihan material memengaruhi estimasi sebagai penyesuaian awal, bukan spesifikasi final.',
                'Gunakan tombol minta penawaran untuk validasi biaya yang lebih akurat.',
            ],
        ];
    }

    private function materialAdjustment(string $group, string $choice): float
    {
        return [
            'wall' => ['bata_merah' => 0.01, 'bata_ringan' => 0.015, 'batako' => -0.01],
            'floor' => ['keramik' => 0, 'granite' => 0.035, 'vinyl' => 0.015],
            'frame' => ['aluminium' => 0.015, 'kayu' => 0.025, 'upvc' => 0.04],
            'paint' => ['standar' => 0, 'weatherproof' => 0.012, 'premium' => 0.02],
            'roof' => ['baja_ringan' => 0, 'genteng_beton' => 0.015, 'genteng_metal' => 0.02],
            'sanitary' => ['ekonomis' => -0.01, 'standar' => 0, 'premium' => 0.025],
        ][$group][$choice] ?? 0;
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
