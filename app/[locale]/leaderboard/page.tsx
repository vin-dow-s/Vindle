import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type Row = {
  username: string | null;
  display_name: string | null;
  score?: number;
  rank?: number;
  total_score?: number;
};

const displayName = (r: Row) => r.username || r.display_name || "—";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const t = dict.leaderboard;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [todayRes, allRes, user] = await Promise.all([
    supabase
      .from("leaderboard_daily")
      .select("username, display_name, score, rank")
      .eq("mode", "daily")
      .eq("locale", locale)
      .eq("date", today)
      .order("rank", { ascending: true })
      .limit(50),
    supabase
      .from("leaderboard_alltime")
      .select("username, display_name, total_score")
      .eq("mode", "daily")
      .eq("locale", locale)
      .order("total_score", { ascending: false })
      .limit(50),
    getUser(),
  ]);

  const todayRows = (todayRes.data ?? []) as Row[];
  const allRows = (allRes.data ?? []) as Row[];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-8">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-strong transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} weight="bold" />
        {t.back}
      </Link>

      <header className="mt-4 flex items-center gap-2.5">
        <Trophy size={28} weight="duotone" className="text-accent-strong" />
        <h1 className="text-2xl font-bold tracking-tight text-ink">{t.title}</h1>
      </header>

      <section className="animate-rise mt-6 rounded-[var(--radius-card)] border border-edge bg-card p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
          {t.today} · {dict.home.daily.title}
        </h2>
        {todayRows.length ? (
          <ol className="mt-3 divide-y divide-edge/60">
            {todayRows.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-right font-bold tabular-nums text-ink-faint">
                    {r.rank}
                  </span>
                  <span className="font-semibold text-ink">{displayName(r)}</span>
                </span>
                <span className="font-bold tabular-nums text-accent-strong">{r.score}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">{t.emptyToday}</p>
        )}
      </section>

      <section
        className="animate-rise mt-4 rounded-[var(--radius-card)] border border-edge bg-card p-5"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
          {t.allTime}
        </h2>
        {allRows.length ? (
          <ol className="mt-3 divide-y divide-edge/60">
            {allRows.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex items-center gap-3">
                  <span className="w-6 text-right font-bold tabular-nums text-ink-faint">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-ink">{displayName(r)}</span>
                </span>
                <span className="font-bold tabular-nums text-accent-strong">
                  {r.total_score}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">{t.emptyAllTime}</p>
        )}
      </section>

      {!user && (
        <Link
          href={`/${locale}/login`}
          className="mt-6 text-center text-sm font-semibold text-accent-strong hover:underline"
        >
          {t.signInPrompt}
        </Link>
      )}
    </main>
  );
}
