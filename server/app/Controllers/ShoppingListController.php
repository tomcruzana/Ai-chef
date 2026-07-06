<?php

namespace AiChef\Controllers;

use AiChef\Core\AppLimits;
use AiChef\Core\Request;
use AiChef\Core\Response;
use AiChef\Services\EmailService;
use AiChef\Services\ShoppingListService;
use RuntimeException;

class ShoppingListController
{
    public function __construct(
        private ShoppingListService $shoppingListService,
        private EmailService $emailService
    )
    {
    }

    public function index(Request $request): Response
    {
        return Response::json(['data' => $this->shoppingListService->all()]);
    }

    public function store(Request $request): Response
    {
        $body = $request->body();
        $items = $body['items'] ?? [$body];
        $createdItems = $this->shoppingListService->createMany(
            is_array($items) ? $items : [],
            AppLimits::MAX_SHOPPING_ITEMS
        );

        if ($createdItems === [] && count($this->shoppingListService->all()) >= AppLimits::MAX_SHOPPING_ITEMS) {
            return Response::json(['message' => 'Your shopping list can hold up to 30 items. Remove one before adding more.'], 422);
        }

        return Response::json(['data' => $createdItems], 201);
    }

    public function toggle(Request $request): Response
    {
        $item = $this->shoppingListService->toggle((string) $request->routeParam('id', ''));

        if ($item === null) {
            return Response::json(['message' => 'Shopping list item not found.'], 404);
        }

        return Response::json(['data' => $item]);
    }

    public function destroy(Request $request): Response
    {
        $deleted = $this->shoppingListService->delete((string) $request->routeParam('id', ''));

        if (!$deleted) {
            return Response::json(['message' => 'Shopping list item not found.'], 404);
        }

        return Response::json(['data' => ['deleted' => true]]);
    }

    public function emailSettings(Request $request): Response
    {
        return Response::json(['data' => $this->emailService->settings()]);
    }

    public function send(Request $request): Response
    {
        try {
            $recipient = trim((string) ($request->body()['recipient'] ?? ''));
            $this->emailService->sendShoppingList($this->shoppingListService->all(), $recipient);

            return Response::json(['data' => ['sent' => true]]);
        } catch (RuntimeException $exception) {
            return Response::json(['message' => $exception->getMessage()], 503);
        }
    }
}
