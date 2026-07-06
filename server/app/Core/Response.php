<?php

namespace AiChef\Core;

class Response
{
    public function __construct(
        private mixed $body = null,
        private int $status = 200,
        private array $headers = []
    ) {
    }

    public static function json(array $body, int $status = 200, array $headers = []): self
    {
        return new self($body, $status, array_merge(['Content-Type' => 'application/json'], $headers));
    }

    public static function noContent(array $headers = []): self
    {
        return new self(null, 204, $headers);
    }

    public function send(): void
    {
        http_response_code($this->status);

        foreach ($this->headers as $name => $value) {
            header($name . ': ' . $value);
        }

        if ($this->status === 204) {
            return;
        }

        echo json_encode($this->body);
    }
}
