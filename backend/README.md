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
4. Manual score grants do not require ITMO.ID as a technical prerequisite; organizers can grant points manually.
5. Friendship graph participation is allowed without linked ITMO.ID.
6. `isu_number` should become optional on regular profiles and be filled/verified from ITMO.ID when linked.

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

## Current integration decisions

- Production hosting: VPS or ITMO-provided infrastructure.
- Expected website domain: `megabattle.itmo.ru`.
- Expected API domain: likely `api.megabattle.itmo.ru`, final DNS decision pending.
- Organizer bot already exists and stores its Mini App inside the bot project.
- Participant bot auth UX should be as simple as possible: website can redirect users to the participant bot, where they confirm account linking.
- ITMO.ID becomes mandatory for official event registration/check-in when access is granted.
- Telegram remains a valid login/linking method for the same Megabattle profile.

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
