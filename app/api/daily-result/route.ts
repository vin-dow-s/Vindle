import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hangmanScore } from "@/lib/game/score";
import { isLocale } from "@/i18n/config";

const MAX_MISTAKES = 5;

/**
 * Records a ranked "Mot du jour" result. The score is computed on the SERVER
 * (never trusted from the client) and written with the service-role key. One
 * result per user per locale per day (ON CONFLICT DO NOTHING).
 *
 * Note: hangman reveals the answer client-side, so this can't fully prevent a
 * determined cheat — it validates shape + computes the score server-side. Full
 * server-validated play is a later hardening step (see the Wordle guess flow).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { locale, success, mistakes, timeMs } = (body ?? {}) as {
    locale?: string;
    success?: boolean;
    mistakes?: number;
    timeMs?: number;
  };

  if (
    !isLocale(locale ?? "") ||
    typeof success !== "boolean" ||
    typeof mistakes !== "number" ||
    mistakes < 0 ||
    mistakes > MAX_MISTAKES
  ) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const safeTime =
    typeof timeMs === "number" && timeMs >= 0
      ? Math.min(Math.round(timeMs), 86_400_000)
      : 0;
  const score = hangmanScore({
    success,
    mistakes,
    maxMistakes: MAX_MISTAKES,
    timeMs: safeTime,
  });
  const date = new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { error } = await admin.from("game_results").upsert(
    {
      user_id: user.id,
      mode: "daily",
      locale,
      date,
      success,
      attempts: mistakes,
      time_ms: safeTime,
      score,
    },
    { onConflict: "user_id,mode,locale,date", ignoreDuplicates: true },
  );

  if (error) {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, score });
}
