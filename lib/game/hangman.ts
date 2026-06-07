import type { GameStatus } from "./types";
import { normalizeWord } from "./normalize";

export interface HangmanConfig {
  /** Number of wrong letters allowed before losing. */
  maxMistakes: number;
}

export const DEFAULT_HANGMAN_CONFIG: HangmanConfig = { maxMistakes: 6 };

export interface HangmanState {
  /** Normalized answer (uppercase A-Z, accents/spaces stripped) used for logic. */
  answer: string;
  /** Letters already tried, uppercase. */
  guessed: string[];
  mistakes: number;
  maxMistakes: number;
  status: GameStatus;
}

export function createHangmanState(
  answer: string,
  config: HangmanConfig = DEFAULT_HANGMAN_CONFIG,
): HangmanState {
  return {
    answer: normalizeWord(answer),
    guessed: [],
    mistakes: 0,
    maxMistakes: config.maxMistakes,
    status: "in_progress",
  };
}

function uniqueLetters(word: string): string[] {
  return [...new Set(word.split(""))];
}

/**
 * Tries a single letter. Pure: returns a new state. A repeated or invalid
 * letter, or a guess after the game is over, is a no-op (returns same state).
 */
export function guessLetter(state: HangmanState, rawLetter: string): HangmanState {
  if (state.status !== "in_progress") return state;

  const letter = normalizeWord(rawLetter);
  if (letter.length !== 1 || state.guessed.includes(letter)) return state;

  const guessed = [...state.guessed, letter];
  const isHit = state.answer.includes(letter);
  const mistakes = isHit ? state.mistakes : state.mistakes + 1;

  const won = uniqueLetters(state.answer).every((c) => guessed.includes(c));

  let status: GameStatus = "in_progress";
  if (won) status = "won";
  else if (mistakes >= state.maxMistakes) status = "lost";

  return { ...state, guessed, mistakes, status };
}

export type LetterOutcome = "hit" | "miss" | "unused";

export function letterOutcome(state: HangmanState, rawLetter: string): LetterOutcome {
  const letter = normalizeWord(rawLetter);
  if (!state.guessed.includes(letter)) return "unused";
  return state.answer.includes(letter) ? "hit" : "miss";
}

/**
 * Whether a given display character should be revealed: punctuation/spaces are
 * always shown; letters are shown once guessed (or when the game is lost).
 */
export function isRevealed(state: HangmanState, displayChar: string): boolean {
  const normalized = normalizeWord(displayChar);
  if (normalized.length === 0) return true; // space, hyphen, apostrophe…
  if (state.status === "lost") return true;
  return state.guessed.includes(normalized);
}

export function remainingLives(state: HangmanState): number {
  return Math.max(0, state.maxMistakes - state.mistakes);
}
