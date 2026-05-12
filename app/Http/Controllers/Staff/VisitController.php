<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function index(Request $request): Response
    {
        $assignments = Assignment::with(['individual', 'service'])
            ->where('staff_id', $request->user()->id)
            ->where('date', today())
            ->get()
            ->map(function ($assignment) use ($request) {
                $visit = Visit::where('assignment_id', $assignment->id)
                    ->where('staff_id', $request->user()->id)
                    ->latest()
                    ->first();

                return [
                    'id'         => $assignment->id,
                    'individual' => $assignment->individual->name,
                    'service'    => $assignment->service->name,
                    'date'       => $assignment->date->toDateString(),
                    'visit'      => $visit ? [
                        'id'     => $visit->id,
                        'status' => $visit->status,
                    ] : null,
                ];
            });

        return Inertia::render('Staff/Visits', [
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, Visit $visit): Response
    {
        $this->authorizeVisit($request, $visit);

        $visit->load(['individual', 'service', 'assignment']);

        return Inertia::render('Staff/VisitActive', [
            'visit' => [
                'id'                  => $visit->id,
                'status'              => $visit->status,
                'individual'          => $visit->individual->name,
                'service'             => $visit->service->name,
                'clock_in_time'       => $visit->clock_in_time?->toIso8601String(),
                'clock_out_time'      => $visit->clock_out_time?->toIso8601String(),
                'total_hours_raw'     => $visit->total_hours_raw,
                'total_hours_rounded' => $visit->total_hours_rounded,
                'total_units'         => $visit->total_units,
            ],
        ]);
    }

    public function review(Request $request, Visit $visit): Response
    {
        $this->authorizeVisit($request, $visit);

        $visit->load(['individual', 'service']);

        return Inertia::render('Staff/VisitReview', [
            'visit' => [
                'id'               => $visit->id,
                'status'           => $visit->status,
                'individual'       => $visit->individual->name,
                'service'          => $visit->service->name,
                'clock_in_time'    => $visit->clock_in_time?->toIso8601String(),
                'clock_out_time'   => $visit->clock_out_time?->toIso8601String(),
                'total_hours_raw'  => $visit->total_hours_raw,
                'total_hours_rounded' => $visit->total_hours_rounded,
                'total_units'      => $visit->total_units,
                'note_staff_raw'   => $visit->note_staff_raw,
                'note_ai_cleaned'  => $visit->note_ai_cleaned,
                'note_ai_summary'  => $visit->note_ai_summary,
                'admin_comment'    => $visit->admin_comment,
            ],
        ]);
    }

    private function authorizeVisit(Request $request, Visit $visit): void
    {
        if ($visit->staff_id !== $request->user()->id) {
            abort(403);
        }
    }
}
