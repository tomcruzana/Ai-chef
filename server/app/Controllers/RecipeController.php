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
    public function __construct(
        private RecipeSuggestionProvider $recipeSuggestionService,
        private RateLimitService $rateLimitService
    )
    {
    }

    public function generate(Request $request): Response
    {
        $ingredients = Validator::stringList($request->input('ingredients', []));
        $preferences = Validator::array($request->input('preferences', []));

        if (($preferences['strictMode'] ?? false) && count($ingredients) < 3) {
            return Response::json(['message' => 'Strict mode requires at least 3 pantry ingredients.'], 422);
        }

        $limit = $this->rateLimitService->hit(
            'recipe-generate:' . $this->clientKey(),
            AppLimits::MAX_RECIPE_GENERATIONS_PER_DAY,
            86400
        );

        if (!$limit['allowed']) {
            return Response::json(
                ['message' => 'You can generate up to 3 recipes per day. Try again tomorrow.'],
                429,
                ['Retry-After' => (string) $limit['retryAfter']]
            );
        }

        try {
            return Response::json([
                'data' => $this->recipeSuggestionService->generate($ingredients, $preferences),
            ]);
        } catch (RuntimeException $exception) {
            return Response::json(['message' => $exception->getMessage()], 502);
        }
    }

    private function clientKey(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
}
