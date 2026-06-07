<?php

namespace App\Services;

use App\Models\AiSetting;
use App\Models\Visit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiNoteService
{
    public function process(Visit $visit): bool
    {
        $settings = $this->settings();
        $prompt   = $this->buildPrompt($visit->note_staff_raw, $settings);

        try {
            $response = $this->callApi($prompt);

            if (! $response->successful()) {
                Log::error('AI note processing failed', ['status' => $response->status(), 'visit_id' => $visit->id]);
                return false;
            }

            $parsed = json_decode($response->json('choices.0.message.content'), true);

            if (! isset($parsed['cleaned_note'], $parsed['structured_summary'])) {
                Log::error('AI response missing expected fields', ['visit_id' => $visit->id]);
                return false;
            }

            $visit->update([
                'note_ai_cleaned'  => $parsed['cleaned_note'],
                'note_ai_summary'  => is_array($parsed['structured_summary'])
                    ? json_encode($parsed['structured_summary'])
                    : $parsed['structured_summary'],
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error('AI note processing exception', ['visit_id' => $visit->id, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function callApi(string $prompt): \Illuminate\Http\Client\Response
    {
        $useAzure = config('services.azure_openai.endpoint') !== null;

        if ($useAzure) {
            $endpoint   = rtrim(config('services.azure_openai.endpoint'), '/');
            $deployment = config('services.azure_openai.deployment', 'gpt-4o');
            $apiVersion = config('services.azure_openai.api_version', '2024-02-01');
            $apiKey     = config('services.azure_openai.key');

            $url = "{$endpoint}/openai/deployments/{$deployment}/chat/completions?api-version={$apiVersion}";

            return Http::withHeaders(['api-key' => $apiKey])
                ->withOptions(['proxy' => ''])
                ->timeout(30)
                ->post($url, [
                    'response_format' => ['type' => 'json_object'],
                    'messages'        => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);
        }

        return Http::withToken(config('services.openai.key'))
            ->withOptions(['proxy' => ''])
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'           => 'gpt-4o',
                'response_format' => ['type' => 'json_object'],
                'messages'        => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);
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

    private function buildPrompt(string $rawNote, AiSetting $settings): string
    {
        $sections = implode("\n", array_map(
            fn ($s) => "- {$s}",
            $settings->section_order ?? $settings->sections
        ));

        $length        = $settings->summary_length;
        $tone          = $settings->tone;
        $cleaningRules = $settings->cleaning_rules
            ? "\nAdditional cleaning rules: {$settings->cleaning_rules}"
            : '';

        return <<<PROMPT
You are a documentation assistant for a home health service provider.

You will receive a raw staff visit note. Your job is to produce TWO outputs:

1. CLEANED NOTE: Fix grammar and spelling only. Do not change meaning. Do not add new information. Do not use clinical language. Do not change any times, names, or EVV-related details.{$cleaningRules}

2. STRUCTURED SUMMARY: Write a {$length}, organized summary using the following sections:
{$sections}

Use a {$tone} tone.

Raw Note:
{$rawNote}

Respond ONLY in this JSON format:
{
  "cleaned_note": "...",
  "structured_summary": {
    "Activities": "...",
    "Participation": "...",
    "Support Provided": "...",
    "Outcomes": "..."
  }
}
PROMPT;
    }
}
