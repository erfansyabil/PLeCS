<?php

namespace App\Http\Controllers;

use App\Models\LearningPath;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LearningPathController extends Controller
{
    public function recommend(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'interests' => ['required', 'array', 'min:1'],
            'interests.*' => ['string'],
            'experience_level' => ['required', 'string'],
            'learning_style' => ['required', 'string'],
            'time_commitment' => ['required', 'string'],
            'career_goals' => ['required', 'string'],
        ]);

        $spaceUrl = config('services.huggingface.space_url');
        $apiToken = config('services.huggingface.api_token');

        if (! $spaceUrl) {
            return response()->json([
                'message' => 'Hugging Face Space URL is not configured.',
            ], 500);
        }

        $payload = [
            // Current survey has interests but no explicit weak/strong topic split.
            'weak_topics' => $validated['interests'],
            'strong_topics' => [],
            'interest' => $validated['career_goals'],
            'level' => $validated['experience_level'],
            'learning_pace' => $validated['time_commitment'],
        ];

        $http = Http::timeout(20)->acceptJson();

        if (! empty($apiToken)) {
            $http = $http->withToken($apiToken);
        }

        $response = $http->post($spaceUrl, $payload);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Unable to fetch recommendations from Hugging Face Space.',
                'status' => $response->status(),
                'error' => $response->body(),
            ], 502);
        }

        $responseData = $response->json();

        $recommendations = collect(data_get($responseData, 'learning_path', []))
            ->map(function ($item) {
                return [
                    'topic' => (string) data_get($item, 'topic', ''),
                    'difficulty' => (string) data_get($item, 'difficulty', ''),
                ];
            })
            ->filter(fn ($item) => $item['topic'] !== '')
            ->values();

        LearningPath::create([
            'user_id' => auth()->id(),
            'path_data' => [
                'survey' => $validated,
                'space_payload' => $payload,
                'space_response' => $responseData,
            ],
        ]);

        return response()->json([
            'message' => 'Recommendations generated successfully.',
            'recommendations' => $recommendations,
            'raw' => $responseData,
        ]);
    }

}
