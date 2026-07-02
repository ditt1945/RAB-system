<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RabTemplateItem extends Model
{
    protected $fillable = [
        'rab_template_id',
        'group_name',
        'name',
        'category',
        'volume',
        'unit',
        'unit_price',
    ];

    public function template()
    {
        return $this->belongsTo(RabTemplate::class, 'rab_template_id');
    }
}
