<?php

namespace AiChef\Services;

class RateLimitService
{
    public function __construct(private JsonFileStorage $storage)
    {
    }

    public function hit(string $key, int $limit, int $windowSeconds): array
    {
        $now = time();
        $records = $this->freshRecords($now);
        $record = $records[$key] ?? [
            'count' => 0,
            'resetAt' => $now + $windowSeconds,
        ];

        if (($record['resetAt'] ?? 0) <= $now) {
            $record = [
                'count' => 0,
                'resetAt' => $now + $windowSeconds,
            ];
        }

        if ((int) ($record['count'] ?? 0) >= $limit) {
            $records[$key] = $record;
            $this->saveRecords($records);

            return [
                'allowed' => false,
                'remaining' => 0,
                'retryAfter' => max(1, (int) $record['resetAt'] - $now),
            ];
        }

        $record['count'] = (int) ($record['count'] ?? 0) + 1;
        $records[$key] = $record;
        $this->saveRecords($records);

        return [
            'allowed' => true,
            'remaining' => max(0, $limit - (int) $record['count']),
            'retryAfter' => max(1, (int) $record['resetAt'] - $now),
        ];
    }

    private function freshRecords(int $now): array
    {
        $freshRecords = [];

        foreach ($this->storage->all() as $record) {
            $key = (string) ($record['key'] ?? '');

            if ($key === '' || (int) ($record['resetAt'] ?? 0) <= $now) {
                continue;
            }

            $freshRecords[$key] = [
                'count' => (int) ($record['count'] ?? 0),
                'resetAt' => (int) ($record['resetAt'] ?? 0),
            ];
        }

        return $freshRecords;
    }

    private function saveRecords(array $records): void
    {
        $items = [];

        foreach ($records as $key => $record) {
            $items[] = [
                'key' => $key,
                'count' => (int) ($record['count'] ?? 0),
                'resetAt' => (int) ($record['resetAt'] ?? 0),
            ];
        }

        $this->storage->saveAll($items);
    }
}
