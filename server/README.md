# AI Chef Server

This folder contains the Core PHP REST API for AI Chef.

## Local Development

Create your local environment file:

```bash
cd server
cp .env.example .env
```

Run the backend with PHP's built-in server:

```bash
php -S localhost:8000 -t public
```

Then open the health endpoint:

```txt
http://localhost:8000/api/health
```

The React frontend calls the backend through:

```txt
http://localhost:8000/api
```

## AI Provider Setup

AI Chef supports mock recipe generation for local development, plus OpenAI and Mistral providers for API-backed recipe generation. All providers use the same backend endpoint:

```txt
POST /api/recipes/generate
```

Use this local setup for now:

```txt
AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
MISTRAL_API_KEY=
MISTRAL_MODEL=mistral-small-latest
```

To use OpenAI, change only your local `server/.env` file:

```txt
AI_PROVIDER=openai
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-4o-mini
```

To use Mistral, change only your local `server/.env` file:

```txt
AI_PROVIDER=mistral
MISTRAL_API_KEY=your_real_key_here
MISTRAL_MODEL=mistral-small-latest
```

Do not put AI API keys in React files, `package.json`, or committed GitHub files. Real provider keys must stay only in your local `server/.env` file.

## Current Server Scope

- Core PHP API foundation
- JSON responses
- Health check endpoint
- Mock recipe generation endpoint
- Pantry API with local JSON storage
- Saved recipes API with local JSON storage
- Shopping list API with local JSON storage
- OpenAI and Mistral recipe generation behind the existing recipe endpoint

More endpoints will be added feature by feature.

## Current Endpoints

```txt
GET    /api/health
POST   /api/recipes/generate
GET    /api/pantry
POST   /api/pantry
PUT    /api/pantry/{id}
DELETE /api/pantry/{id}
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/{id}
DELETE /api/recipes/{id}
GET    /api/shopping-list
POST   /api/shopping-list
PATCH  /api/shopping-list/{id}/toggle
DELETE /api/shopping-list/{id}
```
