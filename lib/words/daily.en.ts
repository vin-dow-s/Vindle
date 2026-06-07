import type { WordEntry } from "./types";
import data from "./daily.en.json";

/**
 * 365 English "Word of the day" entries (hand-curated starter + theme-generated),
 * deduped and validated. Regenerate/extend with scripts/merge-words.mjs.
 */
export const dailyEn: WordEntry[] = data as WordEntry[];
