<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Visit;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'today_assignments' => Assignment::where('staff_id', $user->id)
                ->whereDate('date', today())
                ->count(),
            'in_progress' => Visit::where('staff_id', $user->id)
                ->where('status', 'draft')
                ->count(),
            'submitted' => Visit::where('staff_id', $user->id)
                ->where('status', 'pending_admin')
                ->count(),
            'approved' => Visit::where('staff_id', $user->id)
                ->where('status', 'approved')
                ->count(),
        ];

        $assignmentTrend = collect(range(0, 6))->map(function ($offset) use ($user) {
            $date = Carbon::today()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('D'),
                'count' => Assignment::where('staff_id', $user->id)
                    ->whereDate('date', $date)
                    ->count(),
            ];
        });

        $nextAssignment = Assignment::with(['individual', 'service'])
            ->where('staff_id', $user->id)
            ->whereDate('date', '>=', today())
            ->orderBy('date')
            ->first();

        return Inertia::render('Staff/Dashboard', [
            'stats' => $stats,
            'assignmentTrend' => $assignmentTrend,
            'nextAssignment' => $nextAssignment,
        ]);
    }
}
