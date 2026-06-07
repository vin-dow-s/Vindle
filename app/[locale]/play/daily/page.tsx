import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { dailyWord } from "@/lib/words/daily";
import { getUser } from "@/lib/supabase/auth";
import { HangmanGame } from "@/components/hangman/HangmanGame";

// Resolve today's word at request time.
export const dynamic = "force-dynamic";

export default async function DailyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const entry = dailyWord(locale);
  const user = await getUser();

  return (
    <HangmanGame
      entry={entry}
      labels={dict.dailyPlay}
      backHref={`/${locale}`}
      locale={locale}
      isAuthed={!!user}
    />
  );
}
