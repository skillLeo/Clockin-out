<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'staff_id',
        'individual_id',
        'service_id',
        'date',
        'note',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    public function staff(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function individual(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Individual::class);
    }

    public function service(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function visits(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Visit::class);
    }
}
