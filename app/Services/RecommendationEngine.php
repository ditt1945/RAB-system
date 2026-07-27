<?php

namespace App\Services;

use App\Models\User;

class RecommendationEngine
{
    public function __construct(
        private GeminiService $geminiService,
        private AnalyticsService $analyticsService
    ) {
    }

    /**
     * Get personalized recommendations for a user based on their history
     */
    public function getRecommendations(User $user): array
    {
        $estimations = $user->houseEstimations()
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        if ($estimations->isEmpty()) {
            return $this->getDefaultRecommendations();
        }

        $analytics = $this->analyticsService->getUserAnalytics($user);

        return [
            'suggested_upgrades' => $this->suggestUpgrades($analytics, $estimations),
            'cost_optimization' => $this->suggestCostOptimization($analytics, $estimations),
            'feature_recommendations' => $this->suggestFeatures($analytics, $estimations),
            'next_steps' => $this->getNextSteps($analytics),
        ];
    }

    /**
     * Suggest package upgrades based on user history
     */
    private function suggestUpgrades($analytics, $estimations): array
    {
        $distribution = $analytics['quality_distribution'];
        $mostCommonQuality = null;
        $maxCount = 0;

        foreach ($distribution as $quality => $count) {
            if ($count > $maxCount) {
                $maxCount = $count;
                $mostCommonQuality = $quality;
            }
        }

        if (!$mostCommonQuality) {
            return ['message' => 'Lakukan estimasi lebih banyak untuk mendapat rekomendasi upgrade.'];
        }

        $recommendations = [];

        if ($mostCommonQuality === 'hemat') {
            $recommendations[] = [
                'title' => 'Upgrade ke Paket Standar',
                'description' => 'Mayoritas estimasi Anda menggunakan paket hemat. Pertimbangkan upgrade ke standar untuk kualitas lebih baik dengan peningkatan biaya terjangkau.',
                'benefit' => 'Material lebih tahan lama dan finishing lebih rapi',
                'quality' => 'standar',
            ];
        } elseif ($mostCommonQuality === 'standar') {
            $avgCost = $analytics['avg_cost_per_m2'];
            if ($avgCost > 4000000) {
                $recommendations[] = [
                    'title' => 'Upgrade ke Paket Premium',
                    'description' => 'Anggaran Anda sudah cukup untuk upgrade. Paket premium memberikan finishing eksklusif dan material berkualitas tinggi.',
                    'benefit' => 'Tampilan mewah, durabilitas maksimal, resale value lebih tinggi',
                    'quality' => 'premium',
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Suggest cost optimization strategies
     */
    private function suggestCostOptimization($analytics, $estimations): array
    {
        $avgCostPerM2 = $analytics['avg_cost_per_m2'];
        $avgFloorArea = $analytics['avg_floor_area'];

        $recommendations = [];

        // Check if user tends to add many features
        $populatFeatures = $analytics['popular_features'];
        if (count($populatFeatures) > 3) {
            $recommendations[] = [
                'title' => 'Optimalkan Fitur Tambahan',
                'description' => 'Anda sering menambahkan multiple fitur. Coba fokus pada 2-3 fitur prioritas untuk penghematan biaya hingga 15%.',
                'savings' => '10-15%',
            ];
        }

        // Large floor area optimization
        if ($avgFloorArea > 200) {
            $recommendations[] = [
                'title' => 'Optimasi Luas Bangunan',
                'description' => 'Dengan luas bangunan besar, pertimbangkan design terbuka untuk mengurangi material partisi. Hemat hingga 8%.',
                'savings' => '5-10%',
            ];
        }

        return $recommendations;
    }

    /**
     * Suggest popular features based on user's demographic
     */
    private function suggestFeatures($analytics, $estimations): array
    {
        $currentFeatures = $analytics['popular_features'];
        $allFeatures = ['carport', 'pagar', 'taman', 'rooftop', 'kanopi'];
        $recommendations = [];

        foreach ($allFeatures as $feature) {
            if (!isset($currentFeatures[$feature])) {
                $recommendations[] = [
                    'title' => ucfirst($feature),
                    'description' => $this->getFeatureDescription($feature),
                    'feature' => $feature,
                ];
            }
        }

        return $recommendations;
    }

    /**
     * Get next action recommendations
     */
    private function getNextSteps($analytics): array
    {
        $totalEstimations = $analytics['total_estimations'];
        $recommendations = [];

        if ($totalEstimations < 3) {
            $recommendations[] = [
                'action' => 'buat_lebih_banyak_estimasi',
                'message' => 'Buat minimal 3 estimasi untuk mendapat rekomendasi yang lebih akurat.',
            ];
        } else {
            $recommendations[] = [
                'action' => 'hubungi_kontraktor',
                'message' => 'Sudah siap? Hubungi kontraktor untuk konsultasi lebih lanjut berdasarkan preferensi Anda.',
            ];
        }

        return $recommendations;
    }

    /**
     * Get default recommendations
     */
    private function getDefaultRecommendations(): array
    {
        return [
            'suggested_upgrades' => [
                [
                    'title' => 'Mulai Membuat Estimasi',
                    'description' => 'Buat estimasi pertama Anda dan lihat rekomendasi personal.',
                    'benefit' => 'Dapatkan insight tentang preferensi dan pola pembangunan Anda',
                ]
            ],
            'cost_optimization' => [],
            'feature_recommendations' => [
                ['title' => 'Carport', 'description' => 'Ruang parkir terlindung untuk kendaraan', 'feature' => 'carport'],
                ['title' => 'Pagar', 'description' => 'Keamanan dan privasi properti Anda', 'feature' => 'pagar'],
                ['title' => 'Taman', 'description' => 'Area hijau untuk relaksasi', 'feature' => 'taman'],
            ],
            'next_steps' => [
                [
                    'action' => 'create_estimation',
                    'message' => 'Mulai dengan membuat estimasi pertama Anda',
                ]
            ],
        ];
    }

    /**
     * Get feature description
     */
    private function getFeatureDescription(string $feature): string
    {
        $descriptions = [
            'carport' => 'Ruang parkir terlindung dengan atap, cocok untuk 1-2 kendaraan',
            'pagar' => 'Keamanan dan privasi properti dengan pagar depan dan samping',
            'taman' => 'Area hijau untuk relaksasi dengan landscape design minimal',
            'rooftop' => 'Ruang outdoor di atas genteng dengan utility dan hiburan',
            'kanopi' => 'Naungan tambahan di area outdoor, halaman, atau teras',
        ];

        return $descriptions[$feature] ?? 'Fitur tambahan untuk rumah Anda';
    }
}
