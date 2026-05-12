<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Individual;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $start = today();

        $assignmentTrend = collect(range(0, 6))->map(function (int $offset) use ($start) {
            $date = $start->copy()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('D'),
                'count' => Assignment::whereDate('date', $date)->count(),
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'active_staff' => User::where('role', 'staff')->where('active', true)->count(),
                'individuals' => Individual::count(),
                'services' => Service::count(),
                'today_assignments' => Assignment::whereDate('date', today())->count(),
            ],
            'assignmentTrend' => $assignmentTrend,
            'nextAssignment' => Assignment::with(['staff:id,name', 'individual:id,name', 'service:id,name'])
                ->whereDate('date', '>=', Carbon::today())
                ->orderBy('date')
                ->orderBy('id')
                ->first(),
        ]);
    }
}
