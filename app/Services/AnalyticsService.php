<?php

namespace App\Services;

use App\Models\EstimationAnalytic;
use App\Models\HouseEstimation;
use App\Models\User;

class AnalyticsService
{
    /**
     * Calculate and update analytics for a user
     */
    public function updateUserAnalytics(User $user): void
    {
        $estimations = $user->houseEstimations()->where('status', 'completed')->get();

        if ($estimations->isEmpty()) {
            return;
        }

        // Calculate average cost per m²
        $avgCostPerM2 = $estimations->avg(function ($est) {
            return $est->total_estimate / $est->floor_area;
        });

        EstimationAnalytic::updateOrCreate(
            ['user_id' => $user->id, 'metric_type' => 'avg_cost_per_m2'],
            [
                'data' => ['cost_per_m2' => $avgCostPerM2],
                'average' => $avgCostPerM2,
                'count' => $estimations->count(),
            ]
        );

        // Count by quality
        $qualityCounts = $estimations->groupBy('quality')->map->count();
        EstimationAnalytic::updateOrCreate(
            ['user_id' => $user->id, 'metric_type' => 'quality_distribution'],
            [
                'data' => $qualityCounts->toArray(),
                'count' => $estimations->count(),
            ]
        );

        // Most common features
        $featureCounts = [];
        $estimations->each(function ($est) use (&$featureCounts) {
            if ($est->additional_features) {
                foreach ($est->additional_features as $feature) {
                    $featureCounts[$feature] = ($featureCounts[$feature] ?? 0) + 1;
                }
            }
        });
        arsort($featureCounts);

        EstimationAnalytic::updateOrCreate(
            ['user_id' => $user->id, 'metric_type' => 'popular_features'],
            [
                'data' => $featureCounts,
                'count' => count($featureCounts),
            ]
        );

        // Total estimations
        EstimationAnalytic::updateOrCreate(
            ['user_id' => $user->id, 'metric_type' => 'total_estimations'],
            [
                'count' => $estimations->count(),
                'data' => ['total' => $estimations->count()],
            ]
        );

        // Average floor area
        $avgFloorArea = $estimations->avg('floor_area');
        EstimationAnalytic::updateOrCreate(
            ['user_id' => $user->id, 'metric_type' => 'avg_floor_area'],
            [
                'average' => $avgFloorArea,
                'count' => $estimations->count(),
            ]
        );
    }

    /**
     * Get analytics for a user
     */
    public function getUserAnalytics(User $user): array
    {
        $analytics = EstimationAnalytic::where('user_id', $user->id)->get();

        return [
            'avg_cost_per_m2' => $analytics->firstWhere('metric_type', 'avg_cost_per_m2')?->average ?? 0,
            'quality_distribution' => $analytics->firstWhere('metric_type', 'quality_distribution')?->data ?? [],
            'popular_features' => $analytics->firstWhere('metric_type', 'popular_features')?->data ?? [],
            'total_estimations' => $analytics->firstWhere('metric_type', 'total_estimations')?->count ?? 0,
            'avg_floor_area' => $analytics->firstWhere('metric_type', 'avg_floor_area')?->average ?? 0,
        ];
    }

    /**
     * Get user estimation trends
     */
    public function getUserTrends(User $user): array
    {
        $estimations = $user->houseEstimations()
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->get();

        $monthlyStats = [];
        $estimations->groupBy(function ($date) {
            return $date->created_at->format('Y-m');
        })->each(function ($group, $month) use (&$monthlyStats) {
            $monthlyStats[$month] = [
                'count' => $group->count(),
                'avg_cost' => $group->avg('total_estimate'),
                'avg_m2' => $group->avg('floor_area'),
            ];
        });

        return [
            'monthly_stats' => $monthlyStats,
            'last_6_months' => array_slice(array_reverse($monthlyStats), 0, 6, true),
        ];
    }
}
