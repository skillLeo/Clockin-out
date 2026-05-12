<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminVisitController extends Controller
{
    public function approve(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id' => ['required', 'exists:visits,id'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->status !== 'pending_admin') {
            return response()->json(['error' => 'Only pending visits can be approved.'], 422);
        }

        $visit->update(['status' => 'approved']);

        return response()->json(['message' => 'Visit approved.']);
    }

    public function updateNotes(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id'        => ['required', 'exists:visits,id'],
            'note_staff_raw'  => ['nullable', 'string'],
            'note_ai_cleaned' => ['nullable', 'string'],
            'note_ai_summary' => ['nullable', 'string'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);
        $visit->update(array_filter([
            'note_staff_raw'  => $data['note_staff_raw']  ?? null,
            'note_ai_cleaned' => $data['note_ai_cleaned'] ?? null,
            'note_ai_summary' => $data['note_ai_summary'] ?? null,
        ], fn ($v) => $v !== null));

        return response()->json(['message' => 'Notes updated.']);
    }

    public function reject(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id'      => ['required', 'exists:visits,id'],
            'admin_comment' => ['required', 'string', 'min:1'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->status !== 'pending_admin') {
            return response()->json(['error' => 'Only pending visits can be rejected.'], 422);
        }

        $visit->update([
            'status'        => 'rejected',
            'admin_comment' => $data['admin_comment'],
        ]);

        return response()->json(['message' => 'Visit rejected.']);
    }
}
