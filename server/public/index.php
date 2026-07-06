<?php

$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';

header('Access-Control-Allow-Origin: ' . $frontendUrl);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Guest-Session');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$bootstrapPath = is_file(__DIR__ . '/app/bootstrap.php')
    ? __DIR__ . '/app/bootstrap.php'
    : dirname(__DIR__) . '/app/bootstrap.php';

try {
    $router = require $bootstrapPath;
} catch (Throwable $exception) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'Backend setup error: ' . $exception->getMessage(),
    ]);
    exit;
}

$apiLimitService = new \AiChef\Services\RateLimitService($GLOBALS['ai_chef_database']);
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
