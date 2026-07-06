<?php

namespace AiChef\Services;

use PDO;

class RateLimitService
{
    public function __construct(private PDO $db)
    {
    }

    public function status(string $key, int $limit, int $windowSeconds): array
    {
        $now = time();
        $record = $this->find($key);

        if ($record === null || (int) $record['reset_at'] <= $now) {
            return [
                'limit' => $limit,
                'count' => 0,
                'remaining' => $limit,
                'retryAfter' => $windowSeconds,
                'resetAt' => $now + $windowSeconds,
            ];
        }

        $count = (int) $record['count'];

        return [
            'limit' => $limit,
            'count' => $count,
            'remaining' => max(0, $limit - $count),
            'retryAfter' => max(1, (int) $record['reset_at'] - $now),
            'resetAt' => (int) $record['reset_at'],
        ];
    }

    public function hit(string $key, int $limit, int $windowSeconds): array
    {
        $now = time();
        $record = $this->find($key);

        if ($record === null || (int) $record['reset_at'] <= $now) {
            $record = [
                'count' => 0,
                'reset_at' => $now + $windowSeconds,
            ];
        }

        if ((int) $record['count'] >= $limit) {
            $this->save($key, (int) $record['count'], (int) $record['reset_at']);

            return [
                'allowed' => false,
                'limit' => $limit,
                'count' => (int) $record['count'],
                'remaining' => 0,
                'retryAfter' => max(1, (int) $record['reset_at'] - $now),
                'resetAt' => (int) $record['reset_at'],
            ];
        }

        $count = (int) $record['count'] + 1;
        $this->save($key, $count, (int) $record['reset_at']);

        return [
            'allowed' => true,
            'limit' => $limit,
            'count' => $count,
            'remaining' => max(0, $limit - $count),
            'retryAfter' => max(1, (int) $record['reset_at'] - $now),
            'resetAt' => (int) $record['reset_at'],
        ];
    }

    private function find(string $key): ?array
    {
        $statement = $this->db->prepare('SELECT count, reset_at FROM rate_limits WHERE rate_key = :rate_key LIMIT 1');
        $statement->execute(['rate_key' => $key]);
        $record = $statement->fetch();

        return $record ?: null;
    }

    private function save(string $key, int $count, int $resetAt): void
    {
        $statement = $this->db->prepare(
            'INSERT INTO rate_limits (rate_key, count, reset_at)
             VALUES (:rate_key, :count, :reset_at)
             ON DUPLICATE KEY UPDATE count = VALUES(count), reset_at = VALUES(reset_at)'
        );
        $statement->execute([
            'rate_key' => $key,
            'count' => $count,
            'reset_at' => $resetAt,
        ]);
    }
}
