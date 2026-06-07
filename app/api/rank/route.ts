import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/supabase/auth";
import { isLocale } from "@/i18n/config";

type Row = {
  username: string | null;
  display_name: string | null;
  score: number | null;
  rank: number | null;
  user_id: string;
};

const nameOf = (r: { username: string | null; display_name: string | null }) =>
  r.username || r.display_name || "—";

/**
 * Returns the end-of-game position window (the entry above, you, and the entry
 * below) for a given mode/locale/score. Position is computed from the score so
 * it's correct even before the player's own result has finished syncing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const locale = searchParams.get("locale") ?? "";
  const score = Number(searchParams.get("score"));

  if (
    (mode !== "daily" && mode !== "wordle") ||
    !isLocale(locale) ||
    !Number.isFinite(score)
  ) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("leaderboard_daily")
    .select("username, display_name, score, rank, user_id")
    .eq("mode", mode)
    .eq("locale", locale)
    .eq("date", today)
    .order("rank", { ascending: true })
    .limit(500);
  const rows = (data ?? []) as Row[];

  const user = await getUser();
  const profile = user ? await getProfile() : null;
  const myName = profile ? profile.username || profile.display_name : null;

  // Exclude the player's own row so they don't appear as their own neighbour.
  const others = user ? rows.filter((r) => r.user_id !== user.id) : rows;
  const countAbove = others.filter((r) => (r.score ?? 0) > score).length;
  const above = countAbove > 0 ? others[countAbove - 1] : null;
  const below = others[countAbove] ?? null;

  const fmt = (r: Row | null) =>
    r ? { name: nameOf(r), score: r.score ?? 0, rank: r.rank ?? 0 } : null;

  return NextResponse.json({
    above: fmt(above),
    me: { name: myName, score, rank: countAbove + 1, isMe: !!user },
    below: fmt(below),
    authed: !!user,
  });
}
