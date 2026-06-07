/**
 * Pure scoring functions for ranked (daily) games. Computed on the SERVER at
 * submission time so scores can't be forged from the client.
 *
 * Shape: a solved game is worth a base + a "did better" bonus + a speed bonus.
 * A failed game scores 0 but is still recorded (for streak / played counts).
 */

const BASE = 1000;
const TIME_BONUS_CAP = 300; // points, decays 1 per second

function timeBonus(timeMs: number): number {
  const seconds = Math.floor(Math.max(0, timeMs) / 1000);
  return Math.max(0, TIME_BONUS_CAP - seconds);
}

export function hangmanScore(p: {
  success: boolean;
  mistakes: number;
  maxMistakes: number;
  timeMs: number;
}): number {
  if (!p.success) return 0;
  const livesLeft = Math.max(0, p.maxMistakes - p.mistakes);
  return BASE + livesLeft * 150 + timeBonus(p.timeMs);
}

export function wordleScore(p: {
  success: boolean;
  attempts: number;
  maxAttempts: number;
  timeMs: number;
}): number {
  if (!p.success) return 0;
  // Solving in fewer guesses scores more (1 guess = full bonus).
  const triesSaved = Math.max(0, p.maxAttempts - p.attempts + 1);
  return BASE + triesSaved * 200 + timeBonus(p.timeMs);
}
