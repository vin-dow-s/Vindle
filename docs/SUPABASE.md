# Backend setup (Supabase) — ready to plug in

The app runs fine without Supabase (both game modes are playable). Auth +
leaderboard activate once these env vars are set. Nothing here is wired into a
breaking path: the middleware and clients no-op when env vars are missing.

## 1. Create the project

1. Create a project at <https://supabase.com> (free tier is enough to start).
2. **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Create `.env.local` from `.env.example` and fill those in.

## 2. Run the schema

Open **SQL Editor** in the dashboard and run
[`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

It creates: `profiles` (+ auto-create trigger on signup), `words`,
`daily_schedule`, `game_results`, and the `leaderboard_daily` /
`leaderboard_alltime` views, all with RLS. Key invariants:

- **Leaderboard is registered-only** — `game_results.user_id` is required.
- **No client writes to `game_results`** — only the server (service-role key)
  inserts, after it has validated the guess against the real answer. This is the
  anti-cheat foundation; the daily answer never ships to the client in ranked
  modes (`daily_schedule` has no public read policy).

## 3. Auth providers

In **Authentication → Providers**:

- **Email** → enable magic links (passwordless).
- **Google** → enable, then create OAuth credentials in Google Cloud Console
  (OAuth consent screen + OAuth client). Set the authorized redirect URI to the
  value Supabase shows (`https://<project>.supabase.co/auth/v1/callback`).
- In **Authentication → URL Configuration**, add your site URL
  (`http://localhost:3000` for dev) and redirect URLs.

## 4. Seed words (optional now)

Word data currently lives in `lib/words/daily.*.ts`. To scale and/or move it into
the `words` table, generate more first (see below), then insert into `words`
(`mode='daily'`, `word` normalized, `word_display` accented, `definition` set).

---

## Word generation

Grow the daily set beyond the hand-curated starter:

```bash
ANTHROPIC_API_KEY=sk-... node scripts/generate-words.mjs fr 365
ANTHROPIC_API_KEY=sk-... node scripts/generate-words.mjs en 365
```

Writes validated JSON to `lib/words/generated.<locale>.json` (deduped, definition
never contains the word). **Always human-review** before merging into
`lib/words/daily.<locale>.ts` or seeding Supabase.

For the Wordle/Motus validation dictionary (thousands of allowed guesses), use an
open lexicon rather than the LLM: **Lexique 3.83** for French, the open Wordle
allowed-guesses list for English — filter to length 5/6, drop proper nouns,
normalize accents. (Build script: TODO `scripts/build-valid-guesses.mjs`.)
