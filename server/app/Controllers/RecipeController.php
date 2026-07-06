<?php

namespace AiChef\Controllers;

use AiChef\Core\AppLimits;
use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Core\Validator;
use AiChef\Services\RecipeSuggestionProvider;
use AiChef\Services\RateLimitService;
use RuntimeException;

class RecipeController
{
    private const GENERATION_WINDOW_SECONDS = 86400;

    public function __construct(
        private RecipeSuggestionProvider $recipeSuggestionService,
        private RateLimitService $rateLimitService,
        private string $guestSessionId
    )
    {
    }

    public function generationLimit(Request $request): Response
    {
        return Response::json([
            'data' => $this->currentGenerationLimit(),
        ]);
    }

    public function generate(Request $request): Response
    {
        $ingredients = Validator::stringList($request->input('ingredients', []));
        $preferences = Validator::array($request->input('preferences', []));

        if (($preferences['strictMode'] ?? false) && count($ingredients) < 3) {
            return Response::json(['message' => 'Strict mode requires at least 3 pantry ingredients.'], 422);
        }

        $limit = $this->rateLimitService->hit(
            $this->generationLimitKey(),
            AppLimits::MAX_RECIPE_GENERATIONS_PER_DAY,
            self::GENERATION_WINDOW_SECONDS
        );

        if (!$limit['allowed']) {
            return Response::json(
                [
                    'message' => 'You can generate up to 3 recipes per day. Try again tomorrow.',
                    'data' => ['generationLimit' => $this->formatGenerationLimit($limit)],
                ],
                429,
                ['Retry-After' => (string) $limit['retryAfter']]
            );
        }

        try {
            return Response::json([
                'data' => $this->recipeSuggestionService->generate($ingredients, $preferences),
                'meta' => [
                    'generationLimit' => $this->formatGenerationLimit($limit),
                ],
            ]);
        } catch (RuntimeException $exception) {
            return Response::json(['message' => $exception->getMessage()], 502);
        }
    }

    private function currentGenerationLimit(): array
    {
        return $this->formatGenerationLimit($this->rateLimitService->status(
            $this->generationLimitKey(),
            AppLimits::MAX_RECIPE_GENERATIONS_PER_DAY,
            self::GENERATION_WINDOW_SECONDS
        ));
    }

    private function formatGenerationLimit(array $limit): array
    {
        return [
            'limit' => (int) $limit['limit'],
            'count' => (int) $limit['count'],
            'remaining' => (int) $limit['remaining'],
            'retryAfter' => (int) $limit['retryAfter'],
            'resetAt' => (int) $limit['resetAt'],
        ];
    }

    private function generationLimitKey(): string
    {
        return 'recipe-generate:guest:' . $this->guestSessionId;
    }
}
