# 👨‍🍳 AI Chef

AI Chef is a pantry-based recipe helper. Add what you have on hand, set a few cooking preferences, and generate recipe ideas from the app. It also keeps saved recipes, builds a shopping list, and can email that list when SMTP is configured.

## ✨ Features

- Pantry manager with JSON-backed storage
- Recipe generation through the PHP API
- Mistral, OpenAI, or local mock recipe provider
- Strict mode for using only pantry ingredients
- Saved recipes with full recipe details
- Shopping list with copy and email send
- Cooking step checkboxes and simple timers
- Blue and PinkSalmon theme toggle
- Mobile/tablet-friendly layout

## 🧰 Tech Stack

- React
- Redux Toolkit
- Font Awesome
- Core PHP REST API
- JSON file storage

## 📁 Project Structure

```txt
client/   React frontend
server/   PHP API and JSON storage
```

The old root `src/` and `public/` folders are from the first version of the app. The current app runs from `client/` and `server/`.

## 🚀 Run Locally

Start the backend:

```bash
cd server
copy .env.example .env
php -S localhost:8000 -t public
```

Start the frontend:

```bash
cd client
npm install
npm start
```

Frontend:

```txt
http://localhost:3000
```

API:

```txt
http://localhost:8000/api
```

## 🔑 AI Provider Setup

In `server/.env`, choose one provider:

```env
AI_PROVIDER=mock
```

For Mistral:

```env
AI_PROVIDER=mistral
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-small-latest
```

For OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

Keep API keys in `server/.env`. Do not put keys in React files.

## 📬 Email Setup

Shopping list email uses the recipient typed on the Shopping page. `MAIL_TO` is only a default value for that field.

For Gmail SMTP:

```env
MAIL_ENABLED=true
MAIL_FROM=yourgmail@gmail.com
MAIL_DRIVER=smtp
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USERNAME=yourgmail@gmail.com
MAIL_SMTP_PASSWORD=your_google_app_password
```

Use a Gmail App Password, not the normal Gmail password. If Google shows it with spaces, remove the spaces in `.env`.

## 🧪 Checks

Frontend build:

```bash
cd client
npm run build
```

PHP syntax check:

```bash
cd server
php -l public/index.php
```

For a full PHP lint pass, run `php -l` across the files in `server/app` and `server/public`.
