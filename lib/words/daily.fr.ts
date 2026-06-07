import type { WordEntry } from "./types";
import data from "./daily.fr.json";

/**
 * 365 French "Mot du jour" entries (hand-curated starter + theme-generated),
 * deduped and validated. Regenerate/extend with scripts/merge-words.mjs.
 */
export const dailyFr: WordEntry[] = data as WordEntry[];
