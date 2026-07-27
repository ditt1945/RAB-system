<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationRequest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'location',
        'message',
        'status',
    ];
}
