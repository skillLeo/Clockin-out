<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Visit;
use App\Services\TimeCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisitController extends Controller
{
    public function __construct(private TimeCalculationService $timeService) {}

    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'assignment_id' => ['required', 'exists:assignments,id'],
            'lat'           => ['nullable', 'numeric', 'between:-90,90'],
            'lng'           => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $assignment = Assignment::with(['individual', 'service'])
            ->findOrFail($data['assignment_id']);

        if ($assignment->staff_id !== $request->user()->id) {
            abort(403);
        }

        $existingDraft = Visit::where('assignment_id', $assignment->id)
            ->where('staff_id', $request->user()->id)
            ->where('status', 'draft')
            ->whereNull('clock_out_time')
            ->first();

        if ($existingDraft) {
            return response()->json(['visit_id' => $existingDraft->id]);
        }

        $visit = Visit::create([
            'staff_id'      => $request->user()->id,
            'individual_id' => $assignment->individual_id,
            'service_id'    => $assignment->service_id,
            'assignment_id' => $assignment->id,
            'clock_in_time' => now(),
            'clock_in_lat'  => $data['lat'] ?? null,
            'clock_in_lng'  => $data['lng'] ?? null,
            'status'        => 'draft',
        ]);

        return response()->json(['visit_id' => $visit->id], 201);
    }

    public function end(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id' => ['required', 'exists:visits,id'],
            'lat'      => ['nullable', 'numeric', 'between:-90,90'],
            'lng'      => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->staff_id !== $request->user()->id) {
            abort(403);
        }

        if ($visit->isLocked()) {
            return response()->json(['error' => 'Visit is locked.'], 422);
        }

        if ($visit->clock_out_time) {
            return response()->json(['error' => 'Visit already clocked out.'], 422);
        }

        $clockOut = now();
        $times    = $this->timeService->calculate($visit->clock_in_time, $clockOut);

        $visit->update(array_merge([
            'clock_out_time' => $clockOut,
            'clock_out_lat'  => $data['lat'] ?? null,
            'clock_out_lng'  => $data['lng'] ?? null,
        ], $times));

        return response()->json([
            'total_hours_raw'     => $visit->total_hours_raw,
            'total_hours_rounded' => $visit->total_hours_rounded,
            'total_units'         => $visit->total_units,
        ]);
    }

    public function saveNote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id'      => ['required', 'exists:visits,id'],
            'note_staff_raw'=> ['required', 'string', 'min:1'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->staff_id !== $request->user()->id) {
            abort(403);
        }

        if ($visit->isLocked()) {
            return response()->json(['error' => 'Visit is locked.'], 422);
        }

        $visit->update(['note_staff_raw' => $data['note_staff_raw']]);

        return response()->json(['message' => 'Note saved.']);
    }

    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id' => ['required', 'exists:visits,id'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->staff_id !== $request->user()->id) {
            abort(403);
        }

        if ($visit->isLocked()) {
            return response()->json(['error' => 'Visit is already submitted.'], 422);
        }

        if (! $visit->clock_out_time) {
            return response()->json(['error' => 'Visit must be clocked out before submitting.'], 422);
        }

        if (! $visit->note_staff_raw) {
            return response()->json(['error' => 'A visit note is required before submitting.'], 422);
        }

        $visit->update(['status' => 'pending_admin']);

        return response()->json(['message' => 'Visit submitted for review.']);
    }
}
