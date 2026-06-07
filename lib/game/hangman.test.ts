import { describe, expect, it } from "vitest";
import {
  createHangmanState,
  guessLetter,
  isRevealed,
  letterOutcome,
  remainingLives,
} from "./hangman";

describe("hangman", () => {
  it("normalizes the answer and starts in progress", () => {
    const s = createHangmanState("Crêpe");
    expect(s.answer).toBe("CREPE");
    expect(s.status).toBe("in_progress");
    expect(remainingLives(s)).toBe(6);
  });

  it("reveals all occurrences of a correct letter without costing a life", () => {
    let s = createHangmanState("BANANA");
    s = guessLetter(s, "a");
    expect(s.mistakes).toBe(0);
    expect(letterOutcome(s, "A")).toBe("hit");
    expect(isRevealed(s, "A")).toBe(true);
    expect(isRevealed(s, "B")).toBe(false);
  });

  it("costs a life on a wrong letter", () => {
    let s = createHangmanState("HOUSE");
    s = guessLetter(s, "Z");
    expect(s.mistakes).toBe(1);
    expect(remainingLives(s)).toBe(5);
    expect(letterOutcome(s, "Z")).toBe("miss");
  });

  it("ignores repeated guesses", () => {
    let s = createHangmanState("HOUSE");
    s = guessLetter(s, "Z");
    const again = guessLetter(s, "Z");
    expect(again).toBe(s);
  });

  it("wins when every unique letter is guessed", () => {
    let s = createHangmanState("ABC");
    s = guessLetter(s, "A");
    s = guessLetter(s, "B");
    expect(s.status).toBe("in_progress");
    s = guessLetter(s, "C");
    expect(s.status).toBe("won");
  });

  it("loses after maxMistakes wrong letters", () => {
    let s = createHangmanState("AB", { maxMistakes: 2 });
    s = guessLetter(s, "X");
    expect(s.status).toBe("in_progress");
    s = guessLetter(s, "Y");
    expect(s.status).toBe("lost");
    // answer is fully revealed on loss
    expect(isRevealed(s, "A")).toBe(true);
  });

  it("treats spaces/hyphens in the display word as always revealed", () => {
    const s = createHangmanState("coral reef");
    expect(s.answer).toBe("CORALREEF");
    expect(isRevealed(s, " ")).toBe(true);
    expect(isRevealed(s, "-")).toBe(true);
  });
});
