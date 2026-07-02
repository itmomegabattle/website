-- Megabattle profile/NFC MVP schema.
-- Run this in Supabase SQL editor after creating the project.
-- Auth UI uses Supabase email/password with synthetic emails:
-- <isu_number>@isu.megabattle.ru

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  isu_number text not null unique,
  nickname text not null,
  full_name text,
  faculty text,
  bio text,
  avatar_url text,
  telegram_username text,
  instagram_username text,
  social_links jsonb not null default '[]'::jsonb,
  megaballs integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nfc_tags (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  profile_id uuid references public.profiles(id) on delete set null,
  label text,
  tag_type text check (tag_type in ('keychain', 'card', 'removable', 'sticker', 'other')) default 'other',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid not null references public.profiles(id) on delete cascade,
  receiver_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'hidden', 'blocked')),
  created_at timestamptz not null default now(),
  unique (requester_profile_id, receiver_profile_id),
  check (requester_profile_id <> receiver_profile_id)
);

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  viewer_profile_id uuid references public.profiles(id) on delete set null,
  viewed_profile_id uuid not null references public.profiles(id) on delete cascade,
  nfc_tag_id uuid references public.nfc_tags(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    auth_user_id,
    isu_number,
    nickname,
    full_name,
    faculty
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'isu_number', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'faculty'
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.nfc_tags enable row level security;
alter table public.friendships enable row level security;
alter table public.profile_views enable row level security;

drop policy if exists "profiles are public readable" on public.profiles;
create policy "profiles are public readable"
on public.profiles for select
using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
on public.profiles for insert
with check (auth.uid() = auth_user_id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "nfc tags are public readable" on public.nfc_tags;
create policy "nfc tags are public readable"
on public.nfc_tags for select
using (true);

drop policy if exists "authenticated users create unclaimed nfc tags" on public.nfc_tags;
create policy "authenticated users create unclaimed nfc tags"
on public.nfc_tags for insert
to authenticated
with check (profile_id is null);

drop policy if exists "users claim free nfc tags" on public.nfc_tags;
create policy "users claim free nfc tags"
on public.nfc_tags for update
to authenticated
using (
  profile_id is null
  or exists (
    select 1 from public.profiles
    where profiles.id = nfc_tags.profile_id
      and profiles.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = nfc_tags.profile_id
      and profiles.auth_user_id = auth.uid()
  )
);

drop policy if exists "friendships are public readable" on public.friendships;
create policy "friendships are public readable"
on public.friendships for select
using (status = 'active');

drop policy if exists "users create own friendships" on public.friendships;
create policy "users create own friendships"
on public.friendships for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = friendships.requester_profile_id
      and profiles.auth_user_id = auth.uid()
  )
);

drop policy if exists "users can log profile views" on public.profile_views;
create policy "users can log profile views"
on public.profile_views for insert
with check (
  viewer_profile_id is null
  or exists (
    select 1 from public.profiles
    where profiles.id = profile_views.viewer_profile_id
      and profiles.auth_user_id = auth.uid()
  )
);

drop policy if exists "profile views are readable by admins or participants" on public.profile_views;
create policy "profile views are readable by admins or participants"
on public.profile_views for select
using (
  exists (
    select 1 from public.profiles
    where profiles.auth_user_id = auth.uid()
      and (profiles.is_admin or profiles.id = profile_views.viewer_profile_id or profiles.id = profile_views.viewed_profile_id)
  )
);

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars are public readable" on storage.objects;
create policy "avatars are public readable"
on storage.objects for select
using (bucket_id = 'profile-avatars');

drop policy if exists "authenticated users upload avatars" on storage.objects;
create policy "authenticated users upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-avatars');

drop policy if exists "authenticated users update avatars" on storage.objects;
create policy "authenticated users update avatars"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-avatars')
with check (bucket_id = 'profile-avatars');
