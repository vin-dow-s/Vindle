import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hangmanScore, wordleScore } from "@/lib/game/score";
import { isLocale } from "@/i18n/config";

const MAX_MISTAKES = 5; // daily (hangman)
const MAX_TRIES = 6; // wordle

/**
 * Records a ranked daily result for either mode. The score is computed on the
 * SERVER (never trusted from the client) and written with the service-role key.
 * One result per user per mode per locale per day (ON CONFLICT DO NOTHING).
 *
 * Body: { mode: "daily" | "wordle", locale, success, attempts, timeMs }
 *   - daily:  attempts = number of wrong letters (0–5)
 *   - wordle: attempts = number of guesses made (1–6)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { mode, locale, success, attempts, timeMs } = (body ?? {}) as {
    mode?: string;
    locale?: string;
    success?: boolean;
    attempts?: number;
    timeMs?: number;
  };

  const isDaily = mode === "daily";
  const isWordle = mode === "wordle";
  const maxAttempts = isDaily ? MAX_MISTAKES : MAX_TRIES;

  if (
    !isLocale(locale ?? "") ||
    (!isDaily && !isWordle) ||
    typeof success !== "boolean" ||
    typeof attempts !== "number" ||
    attempts < 0 ||
    attempts > maxAttempts
  ) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const safeTime =
    typeof timeMs === "number" && timeMs >= 0
      ? Math.min(Math.round(timeMs), 86_400_000)
      : 0;

  const score = isDaily
    ? hangmanScore({ success, mistakes: attempts, maxMistakes: MAX_MISTAKES, timeMs: safeTime })
    : wordleScore({ success, attempts, maxAttempts: MAX_TRIES, timeMs: safeTime });

  const date = new Date().toISOString().slice(0, 10);

  const admin = createAdminClient();
  const { error } = await admin.from("game_results").upsert(
    {
      user_id: user.id,
      mode,
      locale,
      date,
      success,
      attempts,
      time_ms: safeTime,
      score,
    },
    { onConflict: "user_id,mode,locale,date", ignoreDuplicates: true },
  );

  if (error) return NextResponse.json({ error: "db error" }, { status: 500 });
  return NextResponse.json({ ok: true, score });
}
