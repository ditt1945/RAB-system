<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabTemplate extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
    ];

    public function items()
    {
        return $this->hasMany(RabTemplateItem::class);
    }
}
