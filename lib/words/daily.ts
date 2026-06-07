import type { Locale } from "@/lib/game/types";
import type { WordEntry } from "./types";
import { dailyFr } from "./daily.fr";
import { dailyEn } from "./daily.en";

const DAILY: Record<Locale, WordEntry[]> = { fr: dailyFr, en: dailyEn };

/**
 * UTC day number since the Unix epoch. Stable for everyone worldwide, so the
 * "word of the day" is identical for all players on a given calendar day.
 * Replaces the legacy `getDate()` (day-of-month) logic, which repeated monthly
 * and silently skipped indices.
 */
export function dayNumber(date: Date = new Date()): number {
  return Math.floor(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
      86_400_000,
  );
}

export function dailyWord(locale: Locale, date: Date = new Date()): WordEntry {
  const list = DAILY[locale];
  return list[dayNumber(date) % list.length];
}

export function dailyCount(locale: Locale): number {
  return DAILY[locale].length;
}
