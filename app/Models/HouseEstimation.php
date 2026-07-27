<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HouseEstimation extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'house_type',
        'floor_area',
        'land_area',
        'bedrooms',
        'bathrooms',
        'quality',
        'location',
        'notes',
        'additional_features',
        'total_estimate',
        'breakdown',
        'summary',
        'status',
    ];

    protected $casts = [
        'additional_features' => 'array',
        'breakdown' => 'array',
        'floor_area' => 'decimal:2',
        'land_area' => 'decimal:2',
        'total_estimate' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
