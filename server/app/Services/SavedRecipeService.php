<?php

namespace AiChef\Services;

use PDO;

class SavedRecipeService
{
    public function __construct(
        private PDO $db,
        private string $guestSessionId
    ) {
    }

    public function all(): array
    {
        $statement = $this->db->prepare(
            'SELECT id, title, servings, difficulty, saved_at FROM saved_recipes WHERE guest_session_id = :guest_session_id ORDER BY saved_at DESC'
        );
        $statement->execute(['guest_session_id' => $this->guestSessionId]);

        return array_map(fn ($row) => [
            'id' => (string) $row['id'],
            'title' => (string) $row['title'],
            'servings' => (int) $row['servings'],
            'difficulty' => (string) $row['difficulty'],
            'savedAt' => $this->formatDate($row['saved_at']),
        ], $statement->fetchAll());
    }

    public function find(string $id): ?array
    {
        $statement = $this->db->prepare('SELECT * FROM saved_recipes WHERE id = :id AND guest_session_id = :guest_session_id LIMIT 1');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);
        $row = $statement->fetch();

        return $row ? $this->mapRecipe($row) : null;
    }

    public function titleExists(string $title): bool
    {
        $statement = $this->db->prepare('SELECT id FROM saved_recipes WHERE guest_session_id = :guest_session_id AND LOWER(title) = LOWER(:title) LIMIT 1');
        $statement->execute([
            'guest_session_id' => $this->guestSessionId,
            'title' => trim($title),
        ]);

        return (bool) $statement->fetch();
    }

    public function create(array $data): array
    {
        $recipe = $this->normalize($data, [
            'id' => $this->id(),
            'savedAt' => $this->timestamp(),
        ]);

        $statement = $this->db->prepare(
            'INSERT INTO saved_recipes
             (id, guest_session_id, title, description, ingredients_json, missing_ingredients_json, instructions_json, prep_time, cook_time, servings, difficulty, saved_at)
             VALUES
             (:id, :guest_session_id, :title, :description, :ingredients_json, :missing_ingredients_json, :instructions_json, :prep_time, :cook_time, :servings, :difficulty, UTC_TIMESTAMP())'
        );
        $statement->execute([
            'id' => $recipe['id'],
            'guest_session_id' => $this->guestSessionId,
            'title' => $recipe['title'],
            'description' => $recipe['description'],
            'ingredients_json' => json_encode($recipe['ingredients'], JSON_UNESCAPED_SLASHES),
            'missing_ingredients_json' => json_encode($recipe['missingIngredients'], JSON_UNESCAPED_SLASHES),
            'instructions_json' => json_encode($recipe['instructions'], JSON_UNESCAPED_SLASHES),
            'prep_time' => $recipe['prepTime'],
            'cook_time' => $recipe['cookTime'],
            'servings' => $recipe['servings'],
            'difficulty' => $recipe['difficulty'],
        ]);

        return $this->find($recipe['id']) ?? $recipe;
    }

    public function delete(string $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM saved_recipes WHERE id = :id AND guest_session_id = :guest_session_id');
        $statement->execute([
            'id' => $id,
            'guest_session_id' => $this->guestSessionId,
        ]);

        return $statement->rowCount() > 0;
    }

    private function normalize(array $data, array $meta): array
    {
        return [
            'id' => $meta['id'],
            'title' => trim((string) ($data['title'] ?? 'Untitled recipe')),
            'description' => trim((string) ($data['description'] ?? '')),
            'ingredients' => $this->stringList($data['ingredients'] ?? []),
            'missingIngredients' => $this->stringList($data['missingIngredients'] ?? []),
            'instructions' => $this->stringList($data['instructions'] ?? []),
            'prepTime' => max(0, (int) ($data['prepTime'] ?? 0)),
            'cookTime' => max(0, (int) ($data['cookTime'] ?? 0)),
            'servings' => max(1, (int) ($data['servings'] ?? 1)),
            'difficulty' => strtolower(trim((string) ($data['difficulty'] ?? 'easy'))) ?: 'easy',
            'savedAt' => $meta['savedAt'],
        ];
    }

    private function mapRecipe(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'title' => (string) $row['title'],
            'description' => (string) ($row['description'] ?? ''),
            'ingredients' => $this->jsonList($row['ingredients_json'] ?? '[]'),
            'missingIngredients' => $this->jsonList($row['missing_ingredients_json'] ?? '[]'),
            'instructions' => $this->jsonList($row['instructions_json'] ?? '[]'),
            'prepTime' => (int) $row['prep_time'],
            'cookTime' => (int) $row['cook_time'],
            'servings' => (int) $row['servings'],
            'difficulty' => (string) $row['difficulty'],
            'savedAt' => $this->formatDate($row['saved_at']),
        ];
    }

    private function stringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($item) => trim((string) $item),
            $value
        )));
    }

    private function jsonList(string $value): array
    {
        $decoded = json_decode($value, true);

        return is_array($decoded) ? $this->stringList($decoded) : [];
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
