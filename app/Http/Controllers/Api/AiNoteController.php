<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Services\AiNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiNoteController extends Controller
{
    public function __construct(private AiNoteService $aiService) {}

    public function process(Request $request): JsonResponse
    {
        $data = $request->validate([
            'visit_id' => ['required', 'exists:visits,id'],
        ]);

        $visit = Visit::findOrFail($data['visit_id']);

        if ($visit->staff_id !== $request->user()->id) {
            abort(403);
        }

        if (! $visit->note_staff_raw) {
            return response()->json(['error' => 'No note to process.'], 422);
        }

        if ($visit->isLocked()) {
            return response()->json(['error' => 'Visit is locked.'], 422);
        }

        $success = $this->aiService->process($visit);
        $visit->refresh();

        return response()->json([
            'success'          => $success,
            'note_ai_cleaned'  => $visit->note_ai_cleaned,
            'note_ai_summary'  => $visit->note_ai_summary,
        ]);
    }
}
