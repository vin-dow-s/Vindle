import type { Locale } from "@/lib/game/types";
import { wordleFr } from "./wordle.fr";
import { wordleEn } from "./wordle.en";
import { dayNumber } from "./daily";

const SOLUTIONS: Record<Locale, string[]> = { fr: wordleFr, en: wordleEn };

/** Random answer for practice mode. */
export function pickWordleAnswer(locale: Locale): string {
  const list = SOLUTIONS[locale];
  return list[Math.floor(Math.random() * list.length)];
}

/** Deterministic daily answer (same for everyone on a given UTC day). */
export function dailyWordleAnswer(locale: Locale, date: Date = new Date()): string {
  const list = SOLUTIONS[locale];
  return list[dayNumber(date) % list.length];
}
