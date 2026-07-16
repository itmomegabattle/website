# Сайт ITMO Megabattle

React/Vite-клиент экосистемы. Авторизация выполняется только через Telegram Login Widget; Supabase Auth не используется. Профили, NFC, знакомства, рейтинги, валюта, контент и админские действия идут через [`imb_backend`](https://github.com/itmomegabattle/imb_backend). Supabase publishable key нужен клиенту только для загрузки файла по одноразовой signed URL, которую выдаёт backend.

## Локальный запуск

```bash
cp .env.example .env.local
npm install
npm run dev
```

Обязательные переменные:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_TELEGRAM_BOT_USERNAME=имя_бота_без_собаки
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=publishable-key
```

## Проверка и деплой

```bash
npm run build
```

На Vercel добавьте те же переменные. Backend должен включить домен сайта в `CORS_ORIGINS` и `PUBLIC_SITE_URL`. В BotFather через `/setdomain` укажите production-домен сайта для Telegram Login Widget.

Маршруты SPA переписываются на `index.html` в `vercel.json`. Тяжёлые страницы и Three.js вынесены в отдельные ленивые чанки.
