import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { dailyWordleAnswer } from "@/lib/words/wordle";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { WordleGame } from "@/components/wordle/WordleGame";

// Resolve today's deterministic word at request time.
export const dynamic = "force-dynamic";

export default async function WordleDailyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const answer = dailyWordleAnswer(locale);
  const user = await getUser();

  // Account-level lock: if this user already has a result today (any device),
  // the game is shown as already played.
  let serverResult: {
    success: boolean;
    attempts: number;
    time_ms: number | null;
  } | null = null;
  if (user) {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("game_results")
      .select("success, attempts, time_ms")
      .eq("user_id", user.id)
      .eq("mode", "wordle")
      .eq("locale", locale)
      .eq("date", today)
      .maybeSingle();
    serverResult = data;
  }

  return (
    <WordleGame
      answer={answer}
      locale={locale}
      labels={dict.wordle}
      rules={dict.help.wordleBody}
      isAuthed={!!user}
      serverResult={serverResult}
    />
  );
}
