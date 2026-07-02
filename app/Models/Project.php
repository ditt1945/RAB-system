<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Project extends Model
{
    protected $fillable = [
        'project_name',
        'client_name',
        'description',
        'start_date',
        'end_date',
        'status',
        'rab_discount',
        'rab_tax_percent',
        'rab_service_fee',
        'target_margin_percent',
        'created_by',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    */

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function rabItems()
    {
        return $this->hasMany(RabItem::class);
    }

    public function rabRevisions()
    {
        return $this->hasMany(RabRevision::class);
    }

    public function changeOrders()
    {
        return $this->hasMany(ChangeOrder::class);
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole('admin')) {
            return $query;
        }

        return $query->where('created_by', $user->id);
    }

    public function isVisibleTo(User $user): bool
    {
        return $user->hasRole('admin') || $this->created_by === $user->id;
    }
}
