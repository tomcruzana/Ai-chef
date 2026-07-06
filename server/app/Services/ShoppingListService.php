<?php

namespace AiChef\Services;

use PDO;

class ShoppingListService
{
    public function __construct(
        private PDO $db,
        private string $guestSessionId
    ) {
    }

    public function all(): array
    {
        $statement = $this->db->prepare('SELECT * FROM shopping_items WHERE guest_session_id = :guest_session_id ORDER BY created_at DESC');
        $statement->execute(['guest_session_id' => $this->guestSessionId]);

        return array_map(fn ($row) => $this->mapRow($row), $statement->fetchAll());
    }

    public function createMany(array $items, int $maxItems = 0): array
    {
        $createdItems = [];

        foreach ($items as $item) {
            $name = trim((string) (is_array($item) ? ($item['name'] ?? '') : $item));

            if ($name === '' || $this->containsName($name)) {
                continue;
            }

            if ($maxItems > 0 && $this->count() >= $maxItems) {
                break;
            }

            $id = $this->id();
            $statement = $this->db->prepare(
                'INSERT INTO shopping_items (id, guest_session_id, name, checked, created_at, updated_at)
                 VALUES (:id, :guest_session_id, :name, 0, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
            );
            $statement->execute([
                'id' => $id,
                'guest_session_id' => $this->guestSessionId,
                'name' => $name,
            ]);

            $created = $this->find($id);
            if ($created !== null) {
                $createdItems[] = $created;
            }
        }

        return $createdItems;
    }

    public function toggle(string $id): ?array
    {
        $item = $this->find($id);

        if ($item === null) {
            return null;
        }

        $statement = $this->db->prepare(
            'UPDATE shopping_items SET checked = :checked, updated_at = UTC_TIMESTAMP() WHERE id = :id AND guest_session_id = :guest_session_id'
        );
        $statement->execute([
            'checked' => $item['checked'] ? 0 : 1,
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);

        return $this->find($id);
    }

    public function delete(string $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM shopping_items WHERE id = :id AND guest_session_id = :guest_session_id');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);

        return $statement->rowCount() > 0;
    }

    private function find(string $id): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM shopping_items WHERE id = :id AND guest_session_id = :guest_session_id LIMIT 1');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);
        $row = $statement->fetch();

        return $row ? $this->mapRow($row) : null;
    }

    private function containsName(string $name): bool
    {
        $statement = $this->db->prepare('SELECT id FROM shopping_items WHERE guest_session_id = :guest_session_id AND LOWER(name) = LOWER(:name) LIMIT 1');
        $statement->execute([
            'guest_session_id' => $this->guestSessionId,
            'name' => $name,
        ]);

        return (bool) $statement->fetch();
    }

    private function count(): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM shopping_items WHERE guest_session_id = :guest_session_id');
        $statement->execute(['guest_session_id' => $this->guestSessionId]);

        return (int) $statement->fetchColumn();
    }

    private function mapRow(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'name' => (string) $row['name'],
            'checked' => (bool) $row['checked'],
            'createdAt' => $this->formatDate($row['created_at']),
            'updatedAt' => $this->formatDate($row['updated_at']),
        ];
    }

    private function id(): string
    {
        return bin2hex(random_bytes(8));
    }

    private function formatDate(string $value): string
    {
        return gmdate('c', strtotime($value) ?: time());
    }
}
