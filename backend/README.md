# ITMO Megabattle Backend

Backend is the future central API for the website, Telegram Mini Apps, two Telegram bots, ITMO.ID, NFC, ratings, events and temporary photos.

Current scope:

- Fastify + TypeScript API skeleton.
- Health endpoint.
- Supabase server client with service role key.
- Telegram verification/webhook placeholders.
- ITMO.ID OIDC placeholders.

## Account strategy

Current launch strategy:

1. Users can start with Telegram identity.
2. Later, when ITMO.ID access is granted, the same profile can be linked to ITMO.ID.
3. Important actions such as official event registration/check-in should require linked ITMO.ID.

Target model:

```text
One Megabattle profile
├─ Telegram identity
└─ ITMO.ID identity
```

This means Telegram login and ITMO.ID login must resolve to the same `profiles.id`, not create separate accounts.

The organizer bot is also written in TypeScript, so the backend is TypeScript too. Later we should extract shared API contracts/types for:

- website;
- backend;
- participant bot;
- organizer bot;
- Telegram Mini Apps.

## Local start

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

## Important

`SUPABASE_SERVICE_ROLE_KEY` must stay only on the backend. Do not put it into Vite env variables or frontend code.

## Planned modules

- Auth: Telegram now, ITMO.ID later.
- Profiles and account linking.
- Roles: participant / organizer / admin.
- NFC tags.
- Friendships graph.
- Ratings and score events.
- Events and registrations.
- Telegram bot webhooks.
- Temporary photos with one-hour cleanup.
