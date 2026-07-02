<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Collection;

class RabSummaryService
{
    public function build(Project $project, Collection $rabItems): array
    {
        $subtotal = (float) $rabItems->sum('subtotal');
        $discount = (float) ($project->rab_discount ?? 0);
        $taxPercent = (float) ($project->rab_tax_percent ?? 0);
        $serviceFee = (float) ($project->rab_service_fee ?? 0);
        $targetMarginPercent = (float) ($project->target_margin_percent ?? 0);
        $taxableTotal = max($subtotal - $discount, 0);
        $taxAmount = $taxableTotal * ($taxPercent / 100);
        $grandTotal = $taxableTotal + $taxAmount + $serviceFee;
        $targetMarginAmount = $taxableTotal * ($targetMarginPercent / 100);
        $estimatedCost = max($taxableTotal - $targetMarginAmount, 0);
        $riskScore = 100;
        $riskScore -= $subtotal <= 0 ? 40 : 0;
        $riskScore -= $targetMarginPercent < 10 ? 20 : 0;
        $riskScore -= $discount > ($subtotal * 0.15) ? 15 : 0;
        $riskScore -= $serviceFee <= 0 ? 5 : 0;
        $riskScore = max(0, min(100, $riskScore));

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax_percent' => $taxPercent,
            'tax_amount' => $taxAmount,
            'service_fee' => $serviceFee,
            'grand_total' => $grandTotal,
            'target_margin_percent' => $targetMarginPercent,
            'target_margin_amount' => $targetMarginAmount,
            'estimated_cost' => $estimatedCost,
            'risk_score' => $riskScore,
            'risk_level' => $riskScore >= 80 ? 'low' : ($riskScore >= 55 ? 'medium' : 'high'),
        ];
    }
}
