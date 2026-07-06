<?php

namespace AiChef\Services;

use PDO;

class PantryService
{
    public function __construct(
        private PDO $db,
        private string $guestSessionId
    ) {
    }

    public function all(): array
    {
        $statement = $this->db->prepare('SELECT * FROM pantry_items WHERE guest_session_id = :guest_session_id ORDER BY created_at ASC');
        $statement->execute(['guest_session_id' => $this->guestSessionId]);

        return array_map(fn ($row) => $this->mapRow($row), $statement->fetchAll());
    }

    public function create(array $data): array
    {
        $item = $this->normalize($data, [
            'id' => $this->id(),
            'createdAt' => $this->timestamp(),
        ]);

        $statement = $this->db->prepare(
            'INSERT INTO pantry_items (id, guest_session_id, name, category, quantity, unit, created_at, updated_at)
             VALUES (:id, :guest_session_id, :name, :category, :quantity, :unit, UTC_TIMESTAMP(), UTC_TIMESTAMP())'
        );
        $statement->execute([
            'id' => $item['id'],
            'guest_session_id' => $this->guestSessionId,
            'name' => $item['name'],
            'category' => $item['category'],
            'quantity' => $item['quantity'],
            'unit' => $item['unit'],
        ]);

        return $this->find($item['id']) ?? $item;
    }

    public function update(string $id, array $data): ?array
    {
        $existingItem = $this->find($id);

        if ($existingItem === null) {
            return null;
        }

        $updated = $this->normalize($data, [
            'id' => $id,
            'createdAt' => $existingItem['createdAt'],
        ]);

        $statement = $this->db->prepare(
            'UPDATE pantry_items
             SET name = :name, category = :category, quantity = :quantity, unit = :unit, updated_at = UTC_TIMESTAMP()
             WHERE id = :id AND guest_session_id = :guest_session_id'
        );
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
            'name' => $updated['name'],
            'category' => $updated['category'],
            'quantity' => $updated['quantity'],
            'unit' => $updated['unit'],
        ]);

        return $this->find($id);
    }

    public function delete(string $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM pantry_items WHERE id = :id AND guest_session_id = :guest_session_id');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);

        return $statement->rowCount() > 0;
    }

    private function find(string $id): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM pantry_items WHERE id = :id AND guest_session_id = :guest_session_id LIMIT 1');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);
        $row = $statement->fetch();

        return $row ? $this->mapRow($row) : null;
    }

    private function normalize(array $data, array $meta): array
    {
        $name = trim((string) ($data['name'] ?? ''));
        $category = trim((string) ($data['category'] ?? '')) ?: $this->inferCategory($name);

        return [
            'id' => $meta['id'],
            'name' => $name,
            'category' => $category,
            'quantity' => trim((string) ($data['quantity'] ?? '')),
            'unit' => trim((string) ($data['unit'] ?? '')),
            'createdAt' => $meta['createdAt'],
            'updatedAt' => $this->timestamp(),
        ];
    }

    private function mapRow(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'name' => (string) $row['name'],
            'category' => (string) $row['category'],
            'quantity' => (string) $row['quantity'],
            'unit' => (string) $row['unit'],
            'createdAt' => $this->formatDate($row['created_at']),
            'updatedAt' => $this->formatDate($row['updated_at']),
        ];
    }

    private function inferCategory(string $name): string
    {
        $normalizedName = strtolower($name);
        $categoryKeywords = [
            'protein' => ['beef', 'chicken', 'egg', 'fish', 'pork', 'salmon', 'shrimp', 'tofu', 'turkey'],
            'produce' => ['apple', 'broccoli', 'carrot', 'garlic', 'lettuce', 'onion', 'pepper', 'potato', 'spinach', 'tomato'],
            'grain' => ['bread', 'noodle', 'oats', 'pasta', 'quinoa', 'rice', 'tortilla'],
            'dairy' => ['butter', 'cheese', 'cream', 'milk', 'yogurt'],
            'spice' => ['basil', 'cumin', 'oregano', 'paprika', 'pepper', 'salt'],
        ];

        foreach ($categoryKeywords as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($normalizedName, $keyword)) {
                    return $category;
                }
            }
        }

        return 'pantry';
    }

    private function id(): string
    {
        return bin2hex(random_bytes(8));
    }

    private function timestamp(): string
    {
        return gmdate('c');
    }

    private function formatDate(string $value): string
    {
        return gmdate('c', strtotime($value) ?: time());
    }
}
