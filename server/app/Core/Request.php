<?php

namespace AiChef\Core;

class Request
{
    private string $method;
    private string $path;
    private array $body;
    private array $routeParams = [];

    public function __construct(string $method, string $path, array $body = [])
    {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->body = $body;
    }

    public static function fromGlobals(): self
    {
        $rawBody = file_get_contents('php://input') ?: '{}';
        $decodedBody = json_decode($rawBody, true);

        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/',
            is_array($decodedBody) ? $decodedBody : []
        );
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function body(): array
    {
        return $this->body;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body[$key] ?? $default;
    }

    public function setRouteParams(array $routeParams): void
    {
        $this->routeParams = $routeParams;
    }

    public function routeParam(string $key, mixed $default = null): mixed
    {
        return $this->routeParams[$key] ?? $default;
    }
}
