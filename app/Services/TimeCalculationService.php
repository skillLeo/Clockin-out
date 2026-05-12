<?php

namespace App\Services;

use Carbon\Carbon;

class TimeCalculationService
{
    public function calculate(Carbon $clockIn, Carbon $clockOut): array
    {
        $minutes      = $clockIn->diffInMinutes($clockOut);
        $rawHours     = $minutes / 60;
        $roundedHours = floor($rawHours * 4) / 4;
        $totalUnits   = (int) ($roundedHours * 4);

        return [
            'total_hours_raw'     => round($rawHours, 4),
            'total_hours_rounded' => $roundedHours,
            'total_units'         => $totalUnits,
        ];
    }
}
