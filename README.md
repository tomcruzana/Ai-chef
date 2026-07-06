# 👨‍🍳 AI Chef

AI Chef is a pantry-based recipe helper where guests can save ingredients, generate recipe ideas, keep favorites, and build a shopping list.

## Live Site

[https://khaki-kingfisher-247608.hostingersite.com/](https://khaki-kingfisher-247608.hostingersite.com/)

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

## Support

[Buy me a coffee](https://buymeacoffee.com/tomcruzana)

## 💻 Tech Stack

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

Create the backend env file:

```bash
cd server
copy .env.example .env
```

Create the MySQL database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Update these values in `server/.env` if your local MySQL setup is different:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_chef
DB_USERNAME=root
DB_PASSWORD=
GUEST_SESSION_TTL_HOURS=24
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

Guest sessions are kept for the configured number of hours. The default is 24. Expired sessions are cleaned up during normal API requests.

## 📧 Email Setup

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

## 🌐 Current Endpoints

```txt
GET    /api/health
GET    /api/recipes/generation-limit
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
GET    /api/shopping-list/email-settings
POST   /api/shopping-list/send
PATCH  /api/shopping-list/{id}/toggle
DELETE /api/shopping-list/{id}
```

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
