import type {
  GameStatus,
  GuessResult,
  LetterState,
  WordleConfig,
  WordleState,
} from "./types";
import { normalizeWord } from "./normalize";

export const DEFAULT_WORDLE_CONFIG: WordleConfig = {
  answerLength: 5,
  maxAttempts: 6,
};

/**
 * Evaluates a guess against an answer using the standard Wordle two-pass rule,
 * which is the only correct way to handle duplicate letters:
 *
 *  1. Mark exact matches as `correct` and "consume" those answer letters.
 *  2. For each remaining guess letter, mark `present` if an unconsumed copy of
 *     that letter still exists in the answer, otherwise `absent`.
 *
 * Both inputs MUST already be normalized (uppercase A-Z) and the same length.
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  if (guess.length !== answer.length) {
    throw new Error(
      `Guess length (${guess.length}) does not match answer length (${answer.length}).`,
    );
  }

  const g = [...guess];
  const a = [...answer];
  const states: LetterState[] = new Array(g.length).fill("absent");
  const remaining: Record<string, number> = {};

  // Pass 1: exact matches.
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      states[i] = "correct";
    } else {
      remaining[a[i]] = (remaining[a[i]] ?? 0) + 1;
    }
  }

  // Pass 2: present-but-misplaced, limited by remaining counts.
  for (let i = 0; i < g.length; i++) {
    if (states[i] === "correct") continue;
    const letter = g[i];
    if ((remaining[letter] ?? 0) > 0) {
      states[i] = "present";
      remaining[letter] -= 1;
    }
  }

  return states;
}

export function createWordleState(
  config: WordleConfig = DEFAULT_WORDLE_CONFIG,
): WordleState {
  return { ...config, guesses: [], status: "in_progress" };
}

export function isWinningEvaluation(states: LetterState[]): boolean {
  return states.length > 0 && states.every((s) => s === "correct");
}

/**
 * Applies a guess to the state and returns a NEW state (pure, no mutation).
 *
 * `answer` is required to evaluate. In server-validated (ranked) modes the
 * server calls this and only sends back the resulting `states`; the client
 * never receives the answer until the game is over.
 */
export function applyGuess(
  state: WordleState,
  rawGuess: string,
  answer: string,
): WordleState {
  if (state.status !== "in_progress") return state;

  const guess = normalizeWord(rawGuess);
  if (guess.length !== state.answerLength) {
    throw new Error(`Guess must be ${state.answerLength} letters.`);
  }

  const states = evaluateGuess(guess, normalizeWord(answer));
  const guesses: GuessResult[] = [...state.guesses, { guess, states }];

  let status: GameStatus = "in_progress";
  if (isWinningEvaluation(states)) {
    status = "won";
  } else if (guesses.length >= state.maxAttempts) {
    status = "lost";
  }

  return { ...state, guesses, status };
}

const STATE_PRECEDENCE: Record<LetterState, number> = {
  absent: 0,
  present: 1,
  correct: 2,
};

/**
 * Best-known state for each letter across all guesses, for coloring the
 * on-screen keyboard. `correct` beats `present` beats `absent`.
 */
export function letterStatuses(
  guesses: GuessResult[],
): Record<string, LetterState> {
  const map: Record<string, LetterState> = {};
  for (const { guess, states } of guesses) {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const next = states[i];
      const current = map[letter];
      if (current === undefined || STATE_PRECEDENCE[next] > STATE_PRECEDENCE[current]) {
        map[letter] = next;
      }
    }
  }
  return map;
}
