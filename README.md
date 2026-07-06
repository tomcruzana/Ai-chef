# 👨‍🍳 AI Chef

AI Chef is a pantry-based recipe helper where guests can save ingredients, generate recipe ideas, keep favorites, and build a shopping list.

## ✨ Features

- Guest pantry sessions saved in MySQL for configurable hours
- Pantry items, favorites, and shopping lists kept separate per browser
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
- MySQL

## 📁 Project Structure

```txt
client/   React frontend
server/   PHP API, MySQL setup, and backend config
```

## 🚀 Run Locally

Start by creating the backend env file:

```bash
cd server
copy .env.example .env
```

Create the MySQL database:

```bash
mysql -u root -p < database/schema.sql
```

Start the backend:

```bash
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
