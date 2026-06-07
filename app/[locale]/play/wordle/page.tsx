import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { dailyWordleAnswer } from "@/lib/words/wordle";
import { getUser } from "@/lib/supabase/auth";
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

  return (
    <WordleGame
      answer={answer}
      locale={locale}
      labels={dict.wordle}
      rules={dict.help.wordleBody}
      isAuthed={!!user}
    />
  );
}
