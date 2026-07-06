<?php

namespace AiChef\Services;

interface RecipeSuggestionProvider
{
    public function generate(array $ingredients, array $preferences): array;
}
