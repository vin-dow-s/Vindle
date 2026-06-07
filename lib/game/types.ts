/**
 * Shared game types for Vindle.
 *
 * These types are framework-agnostic and used both on the server (answer
 * validation / anti-cheat) and on the client (rendering feedback). The answer
 * itself never needs to live in any of these structures — only the per-letter
 * evaluation does.
 */

export type Locale = "fr" | "en";

/** `daily` = the legacy "Mot du jour" hangman-with-definition mode. */
export type GameMode = "daily" | "wordle";

/** Per-letter feedback in Wordle/Motus. */
export type LetterState = "correct" | "present" | "absent";

export type GameStatus = "in_progress" | "won" | "lost";

export interface GuessResult {
  /** Normalized, uppercase guess (A-Z only). */
  guess: string;
  /** Per-letter evaluation, same length as `guess`. */
  states: LetterState[];
}

export interface WordleConfig {
  answerLength: number;
  maxAttempts: number;
}

export interface WordleState extends WordleConfig {
  guesses: GuessResult[];
  status: GameStatus;
}
