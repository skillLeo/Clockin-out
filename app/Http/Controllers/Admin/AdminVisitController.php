<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Individual;
use App\Models\Service;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVisitController extends Controller
{
    public function index(Request $request): Response
    {
        $showScheduled = !$request->filled('status') || $request->status === 'scheduled';

        // Scheduled assignments (no visit started yet)
        $scheduled = [];
        if ($showScheduled) {
            $aQuery = Assignment::with(['staff:id,name', 'individual:id,name', 'service:id,name'])
                ->whereDoesntHave('visits')
                ->orderByDesc('date');

            if ($request->filled('staff_id'))      $aQuery->where('staff_id', $request->staff_id);
            if ($request->filled('individual_id')) $aQuery->where('individual_id', $request->individual_id);
            if ($request->filled('date_from'))     $aQuery->whereDate('date', '>=', $request->date_from);
            if ($request->filled('date_to'))       $aQuery->whereDate('date', '<=', $request->date_to);

            $scheduled = $aQuery->get()->map(fn ($a) => [
                'id'                  => 'a-' . $a->id,
                'staff'               => $a->staff->name,
                'individual'          => $a->individual->name,
                'service'             => $a->service->name,
                'clock_in_time'       => $a->date->toDateString() . 'T00:00:00',
                'status'              => 'scheduled',
                'total_hours_rounded' => null,
                'total_units'         => null,
            ])->values()->all();
        }

        // Actual visit records
        $vQuery = Visit::with(['staff', 'individual', 'service'])
            ->orderByDesc('clock_in_time');

        if ($request->filled('status') && $request->status !== 'scheduled') {
            $vQuery->where('status', $request->status);
        } elseif ($request->status === 'scheduled') {
            $vQuery->whereRaw('1=0'); // show none
        }

        if ($request->filled('staff_id'))      $vQuery->where('staff_id', $request->staff_id);
        if ($request->filled('individual_id')) $vQuery->where('individual_id', $request->individual_id);
        if ($request->filled('date_from'))     $vQuery->whereDate('clock_in_time', '>=', $request->date_from);
        if ($request->filled('date_to'))       $vQuery->whereDate('clock_in_time', '<=', $request->date_to);

        $visits = $vQuery->paginate(25)->through(fn ($v) => [
            'id'                  => $v->id,
            'staff'               => $v->staff->name,
            'individual'          => $v->individual->name,
            'service'             => $v->service->name,
            'clock_in_time'       => $v->clock_in_time?->toIso8601String(),
            'status'              => $v->status,
            'total_hours_rounded' => $v->total_hours_rounded,
            'total_units'         => $v->total_units,
        ]);

        return Inertia::render('Admin/Visits', [
            'visits'      => $visits,
            'scheduled'   => $scheduled,
            'filters'     => $request->only(['status', 'staff_id', 'individual_id', 'date_from', 'date_to']),
            'staffList'   => User::where('role', 'staff')->where('active', true)->orderBy('name')->get(['id', 'name']),
            'individuals' => Individual::orderBy('name')->get(['id', 'name']),
            'services'    => Service::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show(Visit $visit): Response
    {
        $visit->load(['staff', 'individual', 'service', 'assignment']);

        return Inertia::render('Admin/VisitDetail', [
            'visit' => [
                'id'                  => $visit->id,
                'status'              => $visit->status,
                'staff'               => $visit->staff->name,
                'individual'          => $visit->individual->name,
                'service'             => $visit->service->name,
                'clock_in_time'       => $visit->clock_in_time?->toIso8601String(),
                'clock_in_lat'        => $visit->clock_in_lat,
                'clock_in_lng'        => $visit->clock_in_lng,
                'clock_out_time'      => $visit->clock_out_time?->toIso8601String(),
                'clock_out_lat'       => $visit->clock_out_lat,
                'clock_out_lng'       => $visit->clock_out_lng,
                'total_hours_raw'     => $visit->total_hours_raw,
                'total_hours_rounded' => $visit->total_hours_rounded,
                'total_units'         => $visit->total_units,
                'note_staff_raw'      => $visit->note_staff_raw,
                'note_ai_cleaned'     => $visit->note_ai_cleaned,
                'note_ai_summary'     => $visit->note_ai_summary,
                'admin_comment'       => $visit->admin_comment,
            ],
        ]);
    }
}
