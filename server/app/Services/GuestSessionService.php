<?php

namespace AiChef\Services;

use PDO;

class GuestSessionService
{
    public function __construct(
        private PDO $db,
        private int $ttlHours
    )
    {
    }

    public function currentSessionId(): string
    {
        $sessionId = $this->sessionIdFromHeader();

        if ($sessionId === '') {
            $sessionId = bin2hex(random_bytes(16));
        }

        $this->remember($sessionId);

        return $sessionId;
    }

    public function cleanupExpired(): int
    {
        $statement = $this->db->prepare('DELETE FROM guest_sessions WHERE expires_at < UTC_TIMESTAMP()');
        $statement->execute();

        return $statement->rowCount();
    }

    private function remember(string $sessionId): void
    {
        $expiresAt = gmdate('Y-m-d H:i:s', time() + ($this->ttlHours * 3600));

        $statement = $this->db->prepare(
            'INSERT INTO guest_sessions (id, created_at, last_seen_at, expires_at)
             VALUES (:id, UTC_TIMESTAMP(), UTC_TIMESTAMP(), :expires_at)
             ON DUPLICATE KEY UPDATE last_seen_at = UTC_TIMESTAMP(), expires_at = VALUES(expires_at)'
        );
        $statement->execute([
            'id' => $sessionId,
            'expires_at' => $expiresAt,
        ]);
    }

    private function sessionIdFromHeader(): string
    {
        $header = $_SERVER['HTTP_X_GUEST_SESSION'] ?? '';

        if ($header === '' && function_exists('getallheaders')) {
            $headers = getallheaders();
            $header = $headers['X-Guest-Session'] ?? $headers['x-guest-session'] ?? '';
        }

        $sessionId = trim((string) $header);

        return preg_match('/^[a-zA-Z0-9._:-]{16,80}$/', $sessionId) ? $sessionId : '';
    }
}
