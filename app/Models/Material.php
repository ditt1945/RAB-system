<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'name',
        'category',
        'unit',
        'unit_price',
        'supplier',
        'description',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    */

    public function rabItems()
    {
        return $this->hasMany(RabItem::class);
    }
}
