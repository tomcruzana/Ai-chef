<?php

namespace AiChef\Services;

class PantryService
{
    public function __construct(private JsonFileStorage $storage)
    {
    }

    public function all(): array
    {
        return $this->storage->all();
    }

    public function create(array $data): array
    {
        $items = $this->storage->all();
        $item = $this->normalize($data, [
            'id' => $this->id(),
            'createdAt' => $this->timestamp(),
        ]);

        $items[] = $item;
        $this->storage->saveAll($items);

        return $item;
    }

    public function update(string $id, array $data): ?array
    {
        $items = $this->storage->all();

        foreach ($items as $index => $item) {
            if (($item['id'] ?? '') !== $id) {
                continue;
            }

            $updated = $this->normalize($data, [
                'id' => $id,
                'createdAt' => $item['createdAt'] ?? $this->timestamp(),
            ]);

            $items[$index] = $updated;
            $this->storage->saveAll($items);

            return $updated;
        }

        return null;
    }

    public function delete(string $id): bool
    {
        $items = $this->storage->all();
        $filteredItems = array_values(array_filter(
            $items,
            fn ($item) => ($item['id'] ?? '') !== $id
        ));

        if (count($filteredItems) === count($items)) {
            return false;
        }

        $this->storage->saveAll($filteredItems);

        return true;
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
}
