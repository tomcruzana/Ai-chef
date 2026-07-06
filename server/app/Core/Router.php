<?php

namespace AiChef\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function patch(string $path, callable $handler): void
    {
        $this->add('PATCH', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): Response
    {
        foreach ($this->routes as $route) {
            $routeParams = $this->match($route, $request);

            if ($routeParams !== null) {
                $request->setRouteParams($routeParams);
                $response = call_user_func($route['handler'], $request);

                return $response instanceof Response ? $response : Response::json((array) $response);
            }
        }

        return Response::json(['message' => 'Route not found.'], 404);
    }

    private function match(array $route, Request $request): ?array
    {
        if ($route['method'] !== $request->method()) {
            return null;
        }

        $routeSegments = $this->segments($route['path']);
        $requestSegments = $this->segments($request->path());

        if (count($routeSegments) !== count($requestSegments)) {
            return null;
        }

        $params = [];

        foreach ($routeSegments as $index => $routeSegment) {
            if (preg_match('/^\{([A-Za-z_][A-Za-z0-9_]*)\}$/', $routeSegment, $matches)) {
                $params[$matches[1]] = rawurldecode($requestSegments[$index]);
                continue;
            }

            if ($routeSegment !== $requestSegments[$index]) {
                return null;
            }
        }

        return $params;
    }

    private function segments(string $path): array
    {
        $trimmedPath = trim($path, '/');

        return $trimmedPath === '' ? [] : explode('/', $trimmedPath);
    }
}
