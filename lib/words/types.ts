/** A word to guess in the "Mot du jour" mode, with its definition (the clue). */
export interface WordEntry {
  /** Display form — may contain accents, spaces or hyphens. */
  word: string;
  /** Definition shown as the clue. Must not contain the word itself. */
  definition: string;
}
