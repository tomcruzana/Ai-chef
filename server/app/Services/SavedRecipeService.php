<?php

namespace AiChef\Services;

class SavedRecipeService
{
    public function __construct(
        private JsonFileStorage $storage,
        private JsonFileStorage $detailStorage
    ) {
    }

    public function all(): array
    {
        return $this->storage->all();
    }

    public function find(string $id): ?array
    {
        foreach ($this->detailStorage->all() as $recipe) {
            if (($recipe['id'] ?? '') === $id) {
                return $recipe;
            }
        }

        foreach ($this->storage->all() as $recipe) {
            if (($recipe['id'] ?? '') === $id) {
                return $recipe;
            }
        }

        return null;
    }

    public function create(array $data): array
    {
        $recipes = $this->storage->all();
        $details = $this->detailStorage->all();
        $recipe = $this->normalize($data, [
            'id' => $this->id(),
            'savedAt' => $this->timestamp(),
        ]);
        $summary = $this->summary($recipe);

        array_unshift($recipes, $summary);
        array_unshift($details, $recipe);
        $this->storage->saveAll($recipes);
        $this->detailStorage->saveAll($details);

        return $recipe;
    }

    public function delete(string $id): bool
    {
        $recipes = $this->storage->all();
        $details = $this->detailStorage->all();
        $filteredRecipes = array_values(array_filter(
            $recipes,
            fn ($recipe) => ($recipe['id'] ?? '') !== $id
        ));
        $filteredDetails = array_values(array_filter(
            $details,
            fn ($recipe) => ($recipe['id'] ?? '') !== $id
        ));

        if (count($filteredRecipes) === count($recipes) && count($filteredDetails) === count($details)) {
            return false;
        }

        $this->storage->saveAll($filteredRecipes);
        $this->detailStorage->saveAll($filteredDetails);

        return true;
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

    private function summary(array $recipe): array
    {
        return [
            'id' => $recipe['id'],
            'title' => $recipe['title'],
            'servings' => $recipe['servings'],
            'difficulty' => $recipe['difficulty'],
            'savedAt' => $recipe['savedAt'],
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

    private function id(): string
    {
        return bin2hex(random_bytes(8));
    }

    private function timestamp(): string
    {
        return gmdate('c');
    }
}
