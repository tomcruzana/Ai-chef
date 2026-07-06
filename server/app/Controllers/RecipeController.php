<?php

namespace AiChef\Controllers;

use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Core\Validator;
use AiChef\Services\RecipeSuggestionProvider;
use RuntimeException;

class RecipeController
{
    public function __construct(private RecipeSuggestionProvider $recipeSuggestionService)
    {
    }

    public function generate(Request $request): Response
    {
        $ingredients = Validator::stringList($request->input('ingredients', []));
        $preferences = Validator::array($request->input('preferences', []));

        if (($preferences['strictMode'] ?? false) && count($ingredients) < 3) {
            return Response::json(['message' => 'Strict mode requires at least 3 pantry ingredients.'], 422);
        }

        try {
            return Response::json([
                'data' => $this->recipeSuggestionService->generate($ingredients, $preferences),
            ]);
        } catch (RuntimeException $exception) {
            return Response::json(['message' => $exception->getMessage()], 502);
        }
    }
}
