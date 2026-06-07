/**
 * Normalizes a word for comparison in the Wordle/Motus engine.
 *
 * - strips diacritics (é → E, ç → C, …) so French accents don't matter
 * - expands the common French ligatures œ/æ to OE/AE
 * - uppercases and keeps only A-Z (drops spaces, hyphens, apostrophes)
 *
 * The accented form is kept separately (in the DB `word_display` column) for
 * display; matching always happens on this normalized form.
 */
const COMBINING_MARKS = /[̀-ͯ]/g;

export function normalizeWord(input: string): string {
  return input
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/œ/gi, "oe")
    .replace(/æ/gi, "ae")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}
