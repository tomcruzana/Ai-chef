<?php

namespace AiChef\Controllers;

use AiChef\Core\AppLimits;
use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Services\SavedRecipeService;

class SavedRecipeController
{
    public function __construct(
        private SavedRecipeService $savedRecipeService,
        private int $guestSessionTtlHours
    )
    {
    }

    public function index(Request $request): Response
    {
        return Response::json(['data' => $this->savedRecipeService->all()]);
    }

    public function store(Request $request): Response
    {
        $body = $request->body();
        $title = trim((string) ($body['title'] ?? ''));

        if ($title === '') {
            return Response::json(['message' => 'Recipe title is required.'], 422);
        }

        if (count($this->savedRecipeService->all()) >= AppLimits::MAX_SAVED_RECIPES) {
            return Response::json(['message' => 'You can save up to 10 favorite recipes. Delete one before saving another.'], 422);
        }

        if ($this->savedRecipeService->titleExists($title)) {
            return Response::json(['message' => 'This recipe is already saved.'], 422);
        }

        return Response::json([
            'data' => $this->savedRecipeService->create($body),
            'meta' => [
                'guestSessionTtlHours' => $this->guestSessionTtlHours,
            ],
        ], 201);
    }

    public function show(Request $request): Response
    {
        $recipe = $this->savedRecipeService->find((string) $request->routeParam('id', ''));

        if ($recipe === null) {
            return Response::json(['message' => 'Recipe not found.'], 404);
        }

        return Response::json(['data' => $recipe]);
    }

    public function destroy(Request $request): Response
    {
        $deleted = $this->savedRecipeService->delete((string) $request->routeParam('id', ''));

        if (!$deleted) {
            return Response::json(['message' => 'Recipe not found.'], 404);
        }

        return Response::json(['data' => ['deleted' => true]]);
    }
}
