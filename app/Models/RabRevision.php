<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabRevision extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'label',
        'notes',
        'snapshot',
        'subtotal',
        'grand_total',
    ];

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
