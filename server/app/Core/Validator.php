<?php

namespace AiChef\Core;

class Validator
{
    public static function stringList(mixed $value): array
    {
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($item) => trim((string) $item),
            $value
        )));
    }

    public static function array(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }
}
