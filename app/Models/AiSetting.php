<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiSetting extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sections',
        'section_order',
        'summary_length',
        'tone',
        'cleaning_rules',
    ];

    protected function casts(): array
    {
        return [
            'sections'      => 'array',
            'section_order' => 'array',
            'updated_at'    => 'datetime',
        ];
    }
}
