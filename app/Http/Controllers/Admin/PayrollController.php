<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function index(): Response
    {
        $staff = User::where('role', 'staff')->where('active', true)->get(['id', 'name']);

        return Inertia::render('Admin/Payroll', [
            'staff' => $staff,
        ]);
    }

    public function preview(Request $request): JsonResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to'   => ['required', 'date', 'after_or_equal:date_from'],
            'staff_id'  => ['nullable', 'exists:users,id'],
        ]);

        $query = Visit::with(['staff', 'individual', 'service'])
            ->where('status', 'approved')
            ->whereDate('clock_in_time', '>=', $request->date_from)
            ->whereDate('clock_in_time', '<=', $request->date_to)
            ->orderBy('clock_in_time');

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        $records = $query->get()->map(fn ($v) => [
            'id'                  => $v->id,
            'staff'               => $v->staff->name,
            'date'                => $v->clock_in_time->toDateString(),
            'individual'          => $v->individual->name,
            'service'             => $v->service->name,
            'total_hours_raw'     => $v->total_hours_raw,
            'total_hours_rounded' => $v->total_hours_rounded,
            'total_units'         => $v->total_units,
        ]);

        return response()->json([
            'records'      => $records,
            'total_hours'  => round($records->sum('total_hours_rounded'), 2),
            'total_units'  => $records->sum('total_units'),
            'total_visits' => $records->count(),
        ]);
    }

    public function export(Request $request): HttpResponse
    {
        $request->validate([
            'date_from' => ['required', 'date'],
            'date_to'   => ['required', 'date', 'after_or_equal:date_from'],
            'staff_id'  => ['nullable', 'exists:users,id'],
        ]);

        $query = Visit::with(['staff', 'individual', 'service'])
            ->where('status', 'approved')
            ->whereDate('clock_in_time', '>=', $request->date_from)
            ->whereDate('clock_in_time', '<=', $request->date_to);

        if ($request->filled('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }

        $visits = $query->get();

        $handle = fopen('php://temp', 'r+');

        fputcsv($handle, [
            'staff_name',
            'date',
            'individual_name',
            'service_name',
            'total_hours_raw',
            'total_hours_rounded',
            'total_units',
        ]);

        foreach ($visits as $visit) {
            fputcsv($handle, [
                $visit->staff->name,
                $visit->clock_in_time->toDateString(),
                $visit->individual->name,
                $visit->service->name,
                $visit->total_hours_raw,
                $visit->total_hours_rounded,
                $visit->total_units,
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="payroll_' . $request->date_from . '_to_' . $request->date_to . '.csv"',
        ]);
    }
}
