import type { WordleState } from "./types";
import type { HangmanState } from "./hangman";

const STATE_EMOJI = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
} as const;

/** Classic Wordle-style emoji grid: "Vindle - Wordle 4/6\n🟩🟨⬜⬜⬜…". */
export function wordleShareText(
  state: WordleState,
  opts: { title: string; url?: string },
): string {
  const score = state.status === "won" ? String(state.guesses.length) : "X";
  const head = `Vindle - ${opts.title} ${score}/${state.maxAttempts}`;
  const grid = state.guesses
    .map((g) => g.states.map((s) => STATE_EMOJI[s]).join(""))
    .join("\n");
  return [head, grid, opts.url].filter(Boolean).join("\n");
}

/**
 * "Mot du jour" result, e.g.:
 *   Vindle - Word of the day ✅
 *   2 lives left ❤️❤️🖤🖤🖤
 */
export function hangmanShareText(
  state: HangmanState,
  opts: { title: string; livesLabel: string; url?: string },
): string {
  const lives = Math.max(0, state.maxMistakes - state.mistakes);
  const hearts = "❤️".repeat(lives) + "🖤".repeat(state.mistakes);
  const head = `Vindle - ${opts.title} ${state.status === "won" ? "✅" : "❌"}`;
  const line = `${lives} ${opts.livesLabel} ${hearts}`;
  return [head, line, opts.url].filter(Boolean).join("\n");
}
