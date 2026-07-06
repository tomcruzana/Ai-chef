<?php

namespace AiChef\Services;

class RecipeSuggestionService implements RecipeSuggestionProvider
{
    public function generate(array $ingredients, array $preferences): array
    {
        $mainIngredient = $ingredients[0] ?? 'pantry staples';
        $secondIngredient = $ingredients[1] ?? 'seasoning';
        $servings = max(1, (int) ($preferences['servings'] ?? 2));
        $strictMode = (bool) ($preferences['strictMode'] ?? false);
        $recipeIngredients = $strictMode
            ? array_values(array_unique($ingredients))
            : array_values(array_unique(array_merge($ingredients, ['olive oil', 'salt', 'black pepper'])));

        return [
            'title' => ucfirst($mainIngredient) . ' Pantry Bowl',
            'description' => 'A quick recipe generated from your current pantry ingredients.',
            'ingredients' => $recipeIngredients,
            'missingIngredients' => $strictMode ? [] : ['fresh herbs', 'lemon'],
            'instructions' => [
                'Prepare and portion all ingredients.',
                'Cook ' . $mainIngredient . ' until warmed through and lightly browned.',
                'Add ' . $secondIngredient . ' and combine well.',
                $strictMode
                    ? 'Serve using only the pantry ingredients listed above.'
                    : 'Serve warm and finish with fresh herbs or lemon if available.',
            ],
            'prepTime' => 10,
            'cookTime' => 20,
            'servings' => $servings,
            'difficulty' => 'easy',
        ];
    }
}
