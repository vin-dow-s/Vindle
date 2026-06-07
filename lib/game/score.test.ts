import { describe, expect, it } from "vitest";
import { hangmanScore, wordleScore } from "./score";

describe("hangmanScore", () => {
  it("is 0 for a loss", () => {
    expect(hangmanScore({ success: false, mistakes: 6, maxMistakes: 6, timeMs: 1000 })).toBe(0);
  });

  it("rewards remaining lives and speed", () => {
    // 6 lives left, instant: 1000 + 6*150 + 300 = 2200
    expect(hangmanScore({ success: true, mistakes: 0, maxMistakes: 6, timeMs: 0 })).toBe(2200);
    // 2 mistakes (4 left), 10s: 1000 + 4*150 + (300-10) = 1890
    expect(hangmanScore({ success: true, mistakes: 2, maxMistakes: 6, timeMs: 10_000 })).toBe(1890);
  });

  it("floors the time bonus at zero", () => {
    expect(hangmanScore({ success: true, mistakes: 0, maxMistakes: 6, timeMs: 9_999_000 })).toBe(1900);
  });
});

describe("wordleScore", () => {
  it("is 0 for a loss", () => {
    expect(wordleScore({ success: false, attempts: 6, maxAttempts: 6, timeMs: 0 })).toBe(0);
  });

  it("rewards solving in fewer guesses", () => {
    // solved in 1/6, instant: 1000 + 6*200 + 300 = 2500
    expect(wordleScore({ success: true, attempts: 1, maxAttempts: 6, timeMs: 0 })).toBe(2500);
    // solved in 6/6, instant: 1000 + 1*200 + 300 = 1500
    expect(wordleScore({ success: true, attempts: 6, maxAttempts: 6, timeMs: 0 })).toBe(1500);
  });
});
