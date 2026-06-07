import { describe, expect, it } from "vitest";
import {
  applyGuess,
  createWordleState,
  evaluateGuess,
  isWinningEvaluation,
  letterStatuses,
} from "./wordle";

describe("evaluateGuess", () => {
  it("marks an exact match all correct", () => {
    expect(evaluateGuess("CRANE", "CRANE")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("marks a fully wrong guess all absent", () => {
    expect(evaluateGuess("BLIMP", "CRUSH")).toEqual([
      "absent",
      "absent",
      "absent",
      "absent",
      "absent",
    ]);
  });

  it("marks misplaced letters present", () => {
    // STARE vs RATES: same letters, none aligned.
    expect(evaluateGuess("RATES", "STARE")).toEqual([
      "present",
      "present",
      "present",
      "present",
      "present",
    ]);
  });

  it("handles duplicate letters in the guess (ALLOY / LOLLY)", () => {
    // answer ALLOY has two Ls; guess LOLLY has three Ls.
    // index 2 L is correct, index 4 Y is correct, one more L is present,
    // the third L is absent (no copies left).
    expect(evaluateGuess("LOLLY", "ALLOY")).toEqual([
      "present", // L
      "present", // O
      "correct", // L
      "absent", // L (exhausted)
      "correct", // Y
    ]);
  });

  it("handles a repeated guess letter against a single answer letter", () => {
    // PASTA vs BANAL: first A is correct, second A is present.
    expect(evaluateGuess("PASTA", "BANAL")).toEqual([
      "absent", // P
      "correct", // A
      "absent", // S
      "absent", // T
      "present", // A
    ]);
  });

  it("throws on length mismatch", () => {
    expect(() => evaluateGuess("ABCD", "ABCDE")).toThrow();
  });
});

describe("isWinningEvaluation", () => {
  it("is true only when every letter is correct", () => {
    expect(isWinningEvaluation(["correct", "correct"])).toBe(true);
    expect(isWinningEvaluation(["correct", "present"])).toBe(false);
    expect(isWinningEvaluation([])).toBe(false);
  });
});

describe("applyGuess", () => {
  it("normalizes the raw guess and records the evaluation", () => {
    const state = createWordleState();
    const next = applyGuess(state, "crâne", "CRANE");
    expect(next.guesses).toHaveLength(1);
    expect(next.guesses[0].guess).toBe("CRANE");
    expect(next.status).toBe("won");
  });

  it("transitions to lost after maxAttempts wrong guesses", () => {
    let state = createWordleState({ answerLength: 5, maxAttempts: 2 });
    state = applyGuess(state, "BLIMP", "CRANE");
    expect(state.status).toBe("in_progress");
    state = applyGuess(state, "SHOUT", "CRANE");
    expect(state.status).toBe("lost");
  });

  it("ignores further guesses once finished", () => {
    let state = createWordleState();
    state = applyGuess(state, "CRANE", "CRANE");
    const after = applyGuess(state, "BLIMP", "CRANE");
    expect(after).toBe(state);
    expect(after.guesses).toHaveLength(1);
  });

  it("rejects a guess of the wrong length", () => {
    const state = createWordleState();
    expect(() => applyGuess(state, "CAT", "CRANE")).toThrow();
  });
});

describe("letterStatuses", () => {
  it("keeps the best state per letter for the keyboard", () => {
    const guesses = [
      { guess: "ARISE", states: ["present", "absent", "absent", "absent", "absent"] as const },
      { guess: "ABOUT", states: ["correct", "absent", "absent", "absent", "absent"] as const },
    ];
    const map = letterStatuses(guesses.map((g) => ({ ...g, states: [...g.states] })));
    expect(map["A"]).toBe("correct"); // upgraded from present
    expect(map["R"]).toBe("absent");
  });
});
