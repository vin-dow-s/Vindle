import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { pickWordleAnswer } from "@/lib/words/wordle";
import { WordleGame } from "@/components/wordle/WordleGame";

// Practice mode is never cached: each request picks a fresh sample word.
export const dynamic = "force-dynamic";

export default async function WordlePracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const answer = pickWordleAnswer(locale);

  return (
    <WordleGame
      answer={answer}
      locale={locale}
      labels={dict.wordle}
      backHref={`/${locale}`}
    />
  );
}
