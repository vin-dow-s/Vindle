-- Vindle initial schema: profiles, words, daily schedule, game results,
-- leaderboards. Run in the Supabase SQL editor (or via the Supabase CLI).
--
-- Design notes:
--  * Leaderboard is REGISTERED-USERS ONLY (game_results.user_id is required).
--  * game_results is written only by the server (service-role key) AFTER it has
--    validated the guess against the real answer. There are deliberately NO
--    client INSERT/UPDATE policies on game_results — clients can only read.

create extension if not exists citext;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     citext unique,
  display_name text,
  avatar_url   text,
  locale       text not null default 'fr' check (locale in ('fr', 'en')),
  is_premium   boolean not null default false, -- monetization-ready, unused for now
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select using (true);

drop policy if exists "users update their own profile" on public.profiles;
create policy "users update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- words
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.words (
  id           bigint generated always as identity primary key,
  locale       text not null check (locale in ('fr', 'en')),
  mode         text not null check (mode in ('daily', 'wordle')),
  word         text not null,                 -- normalized A-Z, used for matching
  word_display text not null,                 -- accented/display form
  length       int  not null,
  definition   text,                          -- required for 'daily', optional for 'wordle'
  difficulty   int  not null default 1,
  category     text,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  unique (locale, mode, word)
);

create index if not exists words_locale_mode_active_idx
  on public.words (locale, mode, active);

alter table public.words enable row level security;

-- Note: the answer for ranked games is fetched server-side; only metadata is
-- generally exposed. Active words are world-readable for non-ranked features.
drop policy if exists "active words are readable" on public.words;
create policy "active words are readable"
  on public.words for select using (active);

-- ─────────────────────────────────────────────────────────────────────────────
-- daily_schedule — which word is the answer for a given mode/locale/date
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.daily_schedule (
  id       bigint generated always as identity primary key,
  mode     text not null check (mode in ('daily', 'wordle')),
  locale   text not null check (locale in ('fr', 'en')),
  date     date not null,
  word_id  bigint not null references public.words (id),
  unique (mode, locale, date)
);

alter table public.daily_schedule enable row level security;
-- Intentionally NO select policy: the schedule (which reveals answers) is read
-- only by the server via the service-role key.

-- ─────────────────────────────────────────────────────────────────────────────
-- game_results — one row per user per mode/locale/day
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.game_results (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  mode       text not null check (mode in ('daily', 'wordle')),
  locale     text not null check (locale in ('fr', 'en')),
  date       date not null,
  word_id    bigint references public.words (id),
  success    boolean not null,
  attempts   int not null default 0,
  time_ms    int,
  score      int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, mode, locale, date)
);

create index if not exists game_results_board_idx
  on public.game_results (mode, locale, date, score desc);

alter table public.game_results enable row level security;

-- Readable by everyone (public leaderboard). No client write policies:
-- inserts happen only through the server with the service-role key.
drop policy if exists "results are readable by everyone" on public.game_results;
create policy "results are readable by everyone"
  on public.game_results for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- leaderboard views
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view public.leaderboard_daily
with (security_invoker = on) as
select
  gr.mode,
  gr.locale,
  gr.date,
  gr.user_id,
  p.username,
  p.display_name,
  gr.success,
  gr.attempts,
  gr.time_ms,
  gr.score,
  rank() over (
    partition by gr.mode, gr.locale, gr.date
    order by gr.score desc, gr.time_ms asc nulls last
  ) as rank
from public.game_results gr
join public.profiles p on p.id = gr.user_id;

create or replace view public.leaderboard_alltime
with (security_invoker = on) as
select
  gr.user_id,
  p.username,
  p.display_name,
  gr.mode,
  gr.locale,
  count(*) filter (where gr.success) as wins,
  count(*) as played,
  coalesce(sum(gr.score), 0) as total_score
from public.game_results gr
join public.profiles p on p.id = gr.user_id
group by gr.user_id, p.username, p.display_name, gr.mode, gr.locale;
