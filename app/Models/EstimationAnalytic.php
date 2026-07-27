<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstimationAnalytic extends Model
{
    protected $fillable = [
        'user_id',
        'metric_type',
        'data',
        'count',
        'average',
        'period',
    ];

    protected $casts = [
        'data' => 'array',
        'average' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
