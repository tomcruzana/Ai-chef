# AI Chef Server

This folder contains the Core PHP REST API for AI Chef.

## Local Development

Create your local environment file:

```bash
cd server
cp .env.example .env
```

Create the MySQL database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Update the database values in `server/.env` if your local MySQL user is different:

```txt
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_chef
DB_USERNAME=root
DB_PASSWORD=
GUEST_SESSION_TTL_HOURS=24
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
- Browser guest sessions stored in MySQL
- Pantry API backed by MySQL
- Saved recipes and favorites backed by MySQL
- Shopping list API backed by MySQL
- OpenAI and Mistral recipe generation behind the existing recipe endpoint

Guest sessions are kept for the configured number of hours. The default is 24. Expired sessions are removed during normal API requests, and their pantry, recipe, and shopping rows are deleted automatically by database foreign keys.

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
