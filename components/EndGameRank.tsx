"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = { name: string; score: number; rank: number };
type RankData = {
  above: Entry | null;
  me: { name: string | null; score: number; rank: number; isMe: boolean };
  below: Entry | null;
};

function Row({
  rank,
  name,
  score,
  highlight,
}: {
  rank: number;
  name: string;
  score: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm ${
        highlight ? "bg-accent-strong font-semibold text-white" : "text-ink-soft"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="w-5 text-right tabular-nums">{rank}</span>
        <span className="truncate">{name}</span>
      </span>
      <span className="tabular-nums">{score}</span>
    </div>
  );
}

/** End-of-game mini leaderboard: the entry above you, your spot, and the one
 *  below. Guests see "sign in to claim this spot" in place of their name. */
export function EndGameRank({
  mode,
  locale,
  score,
  claimLabel,
}: {
  mode: "daily" | "wordle";
  locale: string;
  score: number;
  claimLabel: string;
}) {
  const [data, setData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/rank?mode=${mode}&locale=${locale}&score=${score}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, locale, score]);

  if (loading) {
    return <div className="h-[5.5rem] w-full max-w-xs animate-pulse rounded-[var(--radius-card)] bg-edge/40" />;
  }
  if (!data) return null;

  return (
    <div className="w-full max-w-xs rounded-[var(--radius-card)] border border-edge bg-card/60 p-2">
      {data.above && (
        <Row rank={data.above.rank} name={data.above.name} score={data.above.score} />
      )}

      {data.me.isMe ? (
        <Row rank={data.me.rank} name={data.me.name ?? "—"} score={data.me.score} highlight />
      ) : (
        <Link href={`/${locale}/login`} className="block transition-transform active:scale-[0.98]">
          <Row rank={data.me.rank} name={claimLabel} score={data.me.score} highlight />
        </Link>
      )}

      {data.below && (
        <Row rank={data.below.rank} name={data.below.name} score={data.below.score} />
      )}
    </div>
  );
}
