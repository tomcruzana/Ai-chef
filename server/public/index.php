<?php

use AiChef\Core\Request;
use AiChef\Core\Response;

$router = require dirname(__DIR__) . '/app/bootstrap.php';

$frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';

header('Access-Control-Allow-Origin: ' . $frontendUrl);
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    Response::noContent()->send();
    exit;
}

$router->dispatch(Request::fromGlobals())->send();
