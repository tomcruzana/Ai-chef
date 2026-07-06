<?php

namespace AiChef\Services;

use RuntimeException;

class OpenAiRecipeSuggestionService implements RecipeSuggestionProvider
{
    private const API_URL = 'https://api.openai.com/v1/chat/completions';

    public function __construct(
        private string $apiKey,
        private string $model,
        private RecipeSuggestionProvider $fallbackProvider
    ) {
    }

    public function generate(array $ingredients, array $preferences): array
    {
        if (trim($this->apiKey) === '') {
            throw new RuntimeException('OpenAI API key is missing. Set OPENAI_API_KEY in server/.env.');
        }

        $payload = [
            'model' => $this->model ?: 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You generate practical home-cooking recipes from pantry ingredients. Return only valid JSON that matches the requested schema.',
                ],
                [
                    'role' => 'user',
                    'content' => $this->buildPrompt($ingredients, $preferences),
                ],
            ],
            'temperature' => 0.7,
            'response_format' => [
                'type' => 'json_schema',
                'json_schema' => [
                    'name' => 'recipe_suggestion',
                    'strict' => true,
                    'schema' => $this->schema(),
                ],
            ],
        ];

        $response = $this->postJson(self::API_URL, $payload);
        $content = $response['choices'][0]['message']['content'] ?? '';
        $recipe = json_decode($content, true);

        if (!is_array($recipe)) {
            throw new RuntimeException('OpenAI returned an invalid recipe response.');
        }

        return $this->normalize($recipe, $ingredients, $preferences);
    }

    private function postJson(string $url, array $payload): array
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $this->apiKey,
                ]),
                'content' => json_encode($payload),
                'ignore_errors' => true,
                'timeout' => 30,
            ],
        ]);

        $rawResponse = file_get_contents($url, false, $context);
        $statusLine = $http_response_header[0] ?? '';
        preg_match('/\s(\d{3})\s/', $statusLine, $matches);
        $statusCode = isset($matches[1]) ? (int) $matches[1] : 0;
        $decodedResponse = json_decode($rawResponse ?: '', true);

        if ($statusCode < 200 || $statusCode >= 300) {
            $message = is_array($decodedResponse)
                ? ($decodedResponse['error']['message'] ?? 'OpenAI request failed.')
                : 'OpenAI request failed.';

            throw new RuntimeException($message);
        }

        if (!is_array($decodedResponse)) {
            throw new RuntimeException('OpenAI returned an unreadable response.');
        }

        return $decodedResponse;
    }

    private function buildPrompt(array $ingredients, array $preferences): string
    {
        return json_encode([
            'availableIngredients' => $ingredients,
            'preferences' => [
                'cuisine' => $preferences['cuisine'] ?? 'any',
                'diet' => $preferences['diet'] ?? 'none',
                'cookingTime' => $preferences['cookingTime'] ?? '30 minutes',
                'servings' => max(1, (int) ($preferences['servings'] ?? 2)),
                'allergies' => $preferences['allergies'] ?? '',
                'dislikes' => $preferences['dislikes'] ?? '',
                'strictMode' => (bool) ($preferences['strictMode'] ?? false),
            ],
            'requirements' => (bool) ($preferences['strictMode'] ?? false)
                ? [
                    'Use only availableIngredients.',
                    'Do not include any missing ingredients.',
                    'Set missingIngredients to an empty array.',
                    'Keep instructions concise and realistic for a home cook.',
                ]
                : [
                    'Use available ingredients when reasonable.',
                    'List missing ingredients separately.',
                    'Keep instructions concise and realistic for a home cook.',
                ],
        ], JSON_UNESCAPED_SLASHES);
    }

    private function normalize(array $recipe, array $ingredients, array $preferences): array
    {
        $fallback = $this->fallbackProvider->generate($ingredients, $preferences);

        return [
            'title' => trim((string) ($recipe['title'] ?? '')) ?: $fallback['title'],
            'description' => trim((string) ($recipe['description'] ?? '')) ?: $fallback['description'],
            'ingredients' => $this->stringList($recipe['ingredients'] ?? $fallback['ingredients']),
            'missingIngredients' => (bool) ($preferences['strictMode'] ?? false)
                ? []
                : $this->stringList($recipe['missingIngredients'] ?? []),
            'instructions' => $this->stringList($recipe['instructions'] ?? $fallback['instructions']),
            'prepTime' => max(0, (int) ($recipe['prepTime'] ?? $fallback['prepTime'])),
            'cookTime' => max(0, (int) ($recipe['cookTime'] ?? $fallback['cookTime'])),
            'servings' => max(1, (int) ($recipe['servings'] ?? ($preferences['servings'] ?? $fallback['servings']))),
            'difficulty' => strtolower(trim((string) ($recipe['difficulty'] ?? $fallback['difficulty']))) ?: 'easy',
        ];
    }

    private function stringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($item) => trim((string) $item),
            $value
        )));
    }

    private function schema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'properties' => [
                'title' => ['type' => 'string'],
                'description' => ['type' => 'string'],
                'ingredients' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'missingIngredients' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'instructions' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'prepTime' => ['type' => 'integer'],
                'cookTime' => ['type' => 'integer'],
                'servings' => ['type' => 'integer'],
                'difficulty' => [
                    'type' => 'string',
                    'enum' => ['easy', 'medium', 'hard'],
                ],
            ],
            'required' => [
                'title',
                'description',
                'ingredients',
                'missingIngredients',
                'instructions',
                'prepTime',
                'cookTime',
                'servings',
                'difficulty',
            ],
        ];
    }
}
