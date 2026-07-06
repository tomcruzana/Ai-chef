<?php

namespace AiChef\Controllers;

use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Services\SavedRecipeService;

class SavedRecipeController
{
    public function __construct(private SavedRecipeService $savedRecipeService)
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

        return Response::json(['data' => $this->savedRecipeService->create($body)], 201);
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
