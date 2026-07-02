<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChangeOrder extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'title',
        'description',
        'amount',
        'status',
        'requested_at',
    ];

    protected $casts = [
        'requested_at' => 'date',
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
