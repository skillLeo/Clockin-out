<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    protected $fillable = [
        'staff_id',
        'individual_id',
        'service_id',
        'assignment_id',
        'clock_in_time',
        'clock_in_lat',
        'clock_in_lng',
        'clock_out_time',
        'clock_out_lat',
        'clock_out_lng',
        'total_hours_raw',
        'total_hours_rounded',
        'total_units',
        'note_staff_raw',
        'note_ai_cleaned',
        'note_ai_summary',
        'status',
        'admin_comment',
    ];

    protected function casts(): array
    {
        return [
            'clock_in_time'  => 'datetime',
            'clock_out_time' => 'datetime',
        ];
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

    public function assignment(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function isLocked(): bool
    {
        return in_array($this->status, ['pending_admin', 'approved', 'rejected']);
    }
}
