import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Heart, X } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/lib/game/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DailyRow = {
  username: string | null;
  display_name: string | null;
  score: number | null;
  rank: number | null;
  success: boolean | null;
  attempts: number | null;
};

const MAX_LIVES = 5;
const MAX_TRIES = 6;
const displayName = (r: { username: string | null; display_name: string | null }) =>
  r.username || r.display_name || "—";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="animate-rise rounded-[var(--radius-card)] border border-edge bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BoardSkeleton({ title }: { title: string }) {
  return (
    <Card title={title}>
      <ul className="mt-3 divide-y divide-edge/60">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center justify-between py-2.5">
            <span className="h-4 w-32 animate-pulse rounded bg-edge/50" />
            <span className="h-4 w-10 animate-pulse rounded bg-edge/50" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ResultBadge({
  success,
  attempts,
  mode,
}: {
  success: boolean | null;
  attempts: number | null;
  mode: "daily" | "wordle";
}) {
  if (!success) {
    return <X size={15} weight="bold" className="text-danger" aria-label="failed" />;
  }
  if (mode === "daily") {
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-accent-strong">
        <Heart size={13} weight="fill" />
        {Math.max(0, MAX_LIVES - (attempts ?? 0))}
      </span>
    );
  }
  return (
    <span className="font-semibold tabular-nums text-ink-soft">
      {attempts ?? 0}/{MAX_TRIES}
    </span>
  );
}

async function DailyBoard({
  locale,
  mode,
  title,
  empty,
}: {
  locale: Locale;
  mode: "daily" | "wordle";
  title: string;
  empty: string;
}) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("leaderboard_daily")
    .select("username, display_name, score, rank, success, attempts")
    .eq("mode", mode)
    .eq("locale", locale)
    .eq("date", today)
    .order("rank", { ascending: true })
    .limit(50);
  const rows = (data ?? []) as DailyRow[];

  return (
    <Card title={title}>
      {rows.length ? (
        <ol className="mt-3 divide-y divide-edge/60">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-5 text-right font-bold tabular-nums text-ink-faint">
                  {r.rank}
                </span>
                <span className="truncate font-semibold text-ink">{displayName(r)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-4">
                <ResultBadge success={r.success} attempts={r.attempts} mode={mode} />
                <span className="w-12 text-right font-bold tabular-nums text-accent-strong">
                  {r.score}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      )}
    </Card>
  );
}

async function AllTimeBoard({
  locale,
  title,
  empty,
}: {
  locale: Locale;
  title: string;
  empty: string;
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboard_alltime")
    .select("user_id, username, display_name, total_score")
    .eq("locale", locale);

  const map = new Map<
    string,
    { username: string | null; display_name: string | null; total: number }
  >();
  for (const r of (data ?? []) as {
    user_id: string;
    username: string | null;
    display_name: string | null;
    total_score: number | null;
  }[]) {
    const cur =
      map.get(r.user_id) ?? {
        username: r.username,
        display_name: r.display_name,
        total: 0,
      };
    cur.total += r.total_score ?? 0;
    map.set(r.user_id, cur);
  }
  const rows = [...map.values()].sort((a, b) => b.total - a.total).slice(0, 50);

  return (
    <Card title={title}>
      {rows.length ? (
        <ol className="mt-3 divide-y divide-edge/60">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-6 text-center text-base font-bold tabular-nums text-ink-faint">
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
                <span className="truncate font-semibold text-ink">{displayName(r)}</span>
              </span>
              <span className="w-14 text-right font-bold tabular-nums text-accent-strong">
                {r.total}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      )}
    </Card>
  );
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const t = dict.leaderboard;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">{t.title}</h1>

      <div className="mt-5 flex flex-col gap-4">
        <Suspense
          fallback={<BoardSkeleton title={`${t.today} · ${dict.home.daily.title}`} />}
        >
          <DailyBoard
            locale={locale}
            mode="daily"
            title={`${t.today} · ${dict.home.daily.title}`}
            empty={t.emptyToday}
          />
        </Suspense>

        <Suspense
          fallback={<BoardSkeleton title={`${t.today} · ${dict.home.wordle.title}`} />}
        >
          <DailyBoard
            locale={locale}
            mode="wordle"
            title={`${t.today} · ${dict.home.wordle.title}`}
            empty={t.emptyToday}
          />
        </Suspense>

        <Suspense fallback={<BoardSkeleton title={t.allTime} />}>
          <AllTimeBoard locale={locale} title={t.allTime} empty={t.emptyAllTime} />
        </Suspense>
      </div>
    </main>
  );
}
