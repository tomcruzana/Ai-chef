<?php

$bootstrapPath = is_file(__DIR__ . '/app/bootstrap.php')
    ? __DIR__ . '/app/bootstrap.php'
    : dirname(__DIR__) . '/app/bootstrap.php';

$router = require $bootstrapPath;

$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';

header('Access-Control-Allow-Origin: ' . $frontendUrl);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    \AiChef\Core\Response::noContent()->send();
    exit;
}

$apiLimitService = new \AiChef\Services\RateLimitService(
    new \AiChef\Services\JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'api-rate-limits.json')
);
$apiLimit = $apiLimitService->hit(
    'api:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
    \AiChef\Core\AppLimits::MAX_API_REQUESTS_PER_15_MINUTES,
    900
);

if (!$apiLimit['allowed']) {
    \AiChef\Core\Response::json(
        ['message' => 'Too many requests. Please wait a few minutes and try again.'],
        429,
        ['Retry-After' => (string) $apiLimit['retryAfter']]
    )->send();
    exit;
}

$router->dispatch(\AiChef\Core\Request::fromGlobals())->send();
