<?php

use AiChef\Controllers\HealthController;
use AiChef\Controllers\PantryController;
use AiChef\Controllers\RecipeController;
use AiChef\Controllers\SavedRecipeController;
use AiChef\Controllers\ShoppingListController;
use AiChef\Core\Router;
use AiChef\Services\EmailService;
use AiChef\Services\JsonFileStorage;
use AiChef\Services\MistralRecipeSuggestionService;
use AiChef\Services\OpenAiRecipeSuggestionService;
use AiChef\Services\PantryService;
use AiChef\Services\RateLimitService;
use AiChef\Services\RecipeSuggestionService;
use AiChef\Services\SavedRecipeService;
use AiChef\Services\ShoppingListService;

define('AI_CHEF_BASE_PATH', dirname(__DIR__));

spl_autoload_register(function (string $class): void {
    $prefix = 'AiChef\\';

    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $relativeClass = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix)));
    $file = AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . $relativeClass . '.php';

    if (is_file($file)) {
        require $file;
    }
});

function ai_chef_load_env(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines ?: [] as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = array_map('trim', explode('=', $line, 2));

        if ($name === '' || getenv($name) !== false) {
            continue;
        }

        $value = trim($value, "\"'");
        putenv($name . '=' . $value);
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}

ai_chef_load_env(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . '.env');

$router = new Router();
$rateLimitService = new RateLimitService(
    new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'rate-limits.json')
);
$healthController = new HealthController();
$pantryController = new PantryController(new PantryService(
    new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'pantry.json')
));
$mockRecipeProvider = new RecipeSuggestionService();
$aiProvider = strtolower((string) getenv('AI_PROVIDER'));

switch ($aiProvider) {
    case 'openai':
        $recipeProvider = new OpenAiRecipeSuggestionService(
            (string) getenv('OPENAI_API_KEY'),
            (string) (getenv('OPENAI_MODEL') ?: 'gpt-4o-mini'),
            $mockRecipeProvider
        );
        break;
    case 'mistral':
        $recipeProvider = new MistralRecipeSuggestionService(
            (string) getenv('MISTRAL_API_KEY'),
            (string) (getenv('MISTRAL_MODEL') ?: 'mistral-small-latest'),
            $mockRecipeProvider
        );
        break;
    default:
        $recipeProvider = $mockRecipeProvider;
        break;
}
$recipeController = new RecipeController($recipeProvider, $rateLimitService);
$savedRecipeController = new SavedRecipeController(new SavedRecipeService(
    new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'recipes.json'),
    new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'recipe-details.json')
));
$shoppingListController = new ShoppingListController(
    new ShoppingListService(
        new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'shopping-list.json')
    ),
    new EmailService(
        (string) getenv('MAIL_ENABLED'),
        (string) getenv('MAIL_TO'),
        (string) getenv('MAIL_FROM'),
        (string) (getenv('MAIL_DRIVER') ?: 'json'),
        (string) getenv('MAIL_SMTP_HOST'),
        (string) (getenv('MAIL_SMTP_PORT') ?: '587'),
        (string) getenv('MAIL_SMTP_USERNAME'),
        (string) getenv('MAIL_SMTP_PASSWORD'),
        new JsonFileStorage(AI_CHEF_BASE_PATH . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'email-outbox.json')
    )
);

$router->get('/api/health', [$healthController, 'show']);
$router->get('/api/pantry', [$pantryController, 'index']);
$router->post('/api/pantry', [$pantryController, 'store']);
$router->put('/api/pantry/{id}', [$pantryController, 'update']);
$router->delete('/api/pantry/{id}', [$pantryController, 'destroy']);
$router->post('/api/recipes/generate', [$recipeController, 'generate']);
$router->get('/api/recipes', [$savedRecipeController, 'index']);
$router->post('/api/recipes', [$savedRecipeController, 'store']);
$router->get('/api/recipes/{id}', [$savedRecipeController, 'show']);
$router->delete('/api/recipes/{id}', [$savedRecipeController, 'destroy']);
$router->get('/api/shopping-list', [$shoppingListController, 'index']);
$router->post('/api/shopping-list', [$shoppingListController, 'store']);
$router->get('/api/shopping-list/email-settings', [$shoppingListController, 'emailSettings']);
$router->post('/api/shopping-list/send', [$shoppingListController, 'send']);
$router->patch('/api/shopping-list/{id}/toggle', [$shoppingListController, 'toggle']);
$router->delete('/api/shopping-list/{id}', [$shoppingListController, 'destroy']);

return $router;
