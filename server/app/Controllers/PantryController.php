<?php

namespace AiChef\Controllers;

use AiChef\Core\AppLimits;
use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Services\PantryService;

class PantryController
{
    public function __construct(private PantryService $pantryService)
    {
    }

    public function index(Request $request): Response
    {
        return Response::json(['data' => $this->pantryService->all()]);
    }

    public function store(Request $request): Response
    {
        $body = $request->body();
        $name = trim((string) ($body['name'] ?? ''));

        if ($name === '') {
            return Response::json(['message' => 'Ingredient name is required.'], 422);
        }

        if (count($this->pantryService->all()) >= AppLimits::MAX_PANTRY_ITEMS) {
            return Response::json(['message' => 'Your pantry can hold up to 40 ingredients. Remove one before adding another.'], 422);
        }

        return Response::json(['data' => $this->pantryService->create($body)], 201);
    }

    public function update(Request $request): Response
    {
        $id = (string) $request->routeParam('id', '');
        $body = $request->body();
        $name = trim((string) ($body['name'] ?? ''));

        if ($name === '') {
            return Response::json(['message' => 'Ingredient name is required.'], 422);
        }

        $item = $this->pantryService->update($id, $body);

        if ($item === null) {
            return Response::json(['message' => 'Pantry item not found.'], 404);
        }

        return Response::json(['data' => $item]);
    }

    public function destroy(Request $request): Response
    {
        $deleted = $this->pantryService->delete((string) $request->routeParam('id', ''));

        if (!$deleted) {
            return Response::json(['message' => 'Pantry item not found.'], 404);
        }

        return Response::json(['data' => ['deleted' => true]]);
    }
}
