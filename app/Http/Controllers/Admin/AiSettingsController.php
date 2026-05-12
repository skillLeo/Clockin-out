<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = $this->settings();

        return Inertia::render('Admin/AiSettings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'sections'       => ['required', 'array', 'min:1'],
            'sections.*'     => ['required', 'string', 'max:100'],
            'section_order'  => ['required', 'array', 'min:1'],
            'section_order.*'=> ['required', 'string', 'max:100'],
            'summary_length' => ['required', 'in:short,medium'],
            'tone'           => ['required', 'string', 'max:100'],
            'cleaning_rules' => ['nullable', 'string'],
        ]);

        $settings = $this->settings();
        $settings->update(array_merge($data, ['updated_at' => now()]));

        return response()->json(['message' => 'AI settings updated.']);
    }

    private function settings(): AiSetting
    {
        return AiSetting::firstOrCreate([], [
            'sections'       => ['Activities', 'Participation', 'Support Provided', 'Outcomes'],
            'section_order'  => ['Activities', 'Participation', 'Support Provided', 'Outcomes'],
            'summary_length' => 'short',
            'tone'           => 'neutral',
            'cleaning_rules' => null,
            'updated_at'     => now(),
        ]);
    }
}
