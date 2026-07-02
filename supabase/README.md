# Supabase setup for Megabattle profiles

## 1. Create project

Create a Supabase project and copy:

- Project URL
- anon public key

Create local `.env` from `.env.example`:

```bash
cp .env.example .env
```

Fill:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Restart `npm run dev` after changing env vars.

## 2. Auth settings for current MVP

Current MVP uses ISU number + password. Internally the app converts ISU to a
synthetic Supabase email:

```txt
123456@isu.megabattle.ru
```

In Supabase Dashboard:

- Authentication → Providers → Email: enabled
- Authentication → Sign In / Providers: email/password enabled
- Email confirmation: disabled for this MVP

Later this auth layer can be replaced with ITMO ID while keeping `profiles`,
`nfc_tags`, and `friendships`.

## 3. Database schema

Run `schema.sql` in Supabase SQL editor.

It creates:

- `profiles`
- `nfc_tags`
- `friendships`
- `profile_views`
- public avatar storage bucket `profile-avatars`
- RLS policies
- admin-ready `profiles.is_admin`

## 4. NFC URL format

Use path-based URLs:

```txt
https://your-domain.ru/nfc/<tag-code>
```

For local testing:

```txt
http://127.0.0.1:5173/nfc/test-keychain-001
```

One profile can claim many NFC tags.
