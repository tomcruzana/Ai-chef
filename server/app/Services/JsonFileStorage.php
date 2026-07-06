<?php

namespace AiChef\Services;

class JsonFileStorage
{
    public function __construct(private string $filePath)
    {
        $directory = dirname($this->filePath);

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        if (!is_file($this->filePath)) {
            file_put_contents($this->filePath, json_encode([], JSON_PRETTY_PRINT));
        }
    }

    public function all(): array
    {
        $contents = file_get_contents($this->filePath);
        $decoded = json_decode($contents ?: '[]', true);

        return is_array($decoded) ? array_values($decoded) : [];
    }

    public function saveAll(array $items): void
    {
        file_put_contents(
            $this->filePath,
            json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        );
    }
}
