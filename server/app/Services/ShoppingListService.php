<?php

namespace AiChef\Services;

class ShoppingListService
{
    public function __construct(private JsonFileStorage $storage)
    {
    }

    public function all(): array
    {
        return $this->storage->all();
    }

    public function createMany(array $items, int $maxItems = 0): array
    {
        $currentItems = $this->storage->all();
        $createdItems = [];

        foreach ($items as $item) {
            $name = trim((string) (is_array($item) ? ($item['name'] ?? '') : $item));

            if ($name === '' || $this->containsName($currentItems, $name)) {
                continue;
            }

            if ($maxItems > 0 && count($currentItems) >= $maxItems) {
                break;
            }

            $createdItem = [
                'id' => $this->id(),
                'name' => $name,
                'checked' => false,
                'createdAt' => $this->timestamp(),
                'updatedAt' => $this->timestamp(),
            ];

            $currentItems[] = $createdItem;
            $createdItems[] = $createdItem;
        }

        $this->storage->saveAll($currentItems);

        return $createdItems;
    }

    public function toggle(string $id): ?array
    {
        $items = $this->storage->all();

        foreach ($items as $index => $item) {
            if (($item['id'] ?? '') !== $id) {
                continue;
            }

            $items[$index]['checked'] = !((bool) ($item['checked'] ?? false));
            $items[$index]['updatedAt'] = $this->timestamp();
            $this->storage->saveAll($items);

            return $items[$index];
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

    private function containsName(array $items, string $name): bool
    {
        foreach ($items as $item) {
            if (strtolower((string) ($item['name'] ?? '')) === strtolower($name)) {
                return true;
            }
        }

        return false;
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
