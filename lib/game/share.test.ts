import { describe, expect, it } from "vitest";
import { wordleShareText, hangmanShareText } from "./share";
import { createWordleState } from "./wordle";
import { createHangmanState } from "./hangman";
import type { WordleState } from "./types";

describe("wordleShareText", () => {
  it("renders an emoji grid with the score", () => {
    const state: WordleState = {
      ...createWordleState(),
      status: "won",
      guesses: [
        { guess: "ARISE", states: ["absent", "present", "absent", "absent", "correct"] },
        { guess: "CRANE", states: ["correct", "correct", "correct", "correct", "correct"] },
      ],
    };
    expect(wordleShareText(state, { title: "Wordle", locale: "en" })).toBe(
      ["Vindle - Wordle [EN] 2/6", "⬜🟨⬜⬜🟩", "🟩🟩🟩🟩🟩"].join("\n"),
    );
  });

  it("uses X for a loss", () => {
    const state: WordleState = { ...createWordleState(), status: "lost", guesses: [] };
    expect(wordleShareText(state, { title: "Wordle", locale: "fr" })).toBe(
      "Vindle - Wordle [FR] X/6",
    );
  });
});

describe("hangmanShareText", () => {
  it("matches the lives-left format on a win", () => {
    const state = {
      ...createHangmanState("ABC", { maxMistakes: 5 }),
      status: "won" as const,
      mistakes: 3,
    };
    expect(
      hangmanShareText(state, {
        title: "Word of the day",
        livesLabel: "lives left",
        locale: "en",
      }),
    ).toBe("Vindle - Word of the day [EN] ✅\n2 lives left ❤️❤️🖤🖤🖤");
  });

  it("uses ❌ on a loss", () => {
    const state = {
      ...createHangmanState("ABC", { maxMistakes: 5 }),
      status: "lost" as const,
      mistakes: 5,
    };
    expect(
      hangmanShareText(state, {
        title: "Mot du jour",
        livesLabel: "vies restantes",
        locale: "fr",
      }),
    ).toBe("Vindle - Mot du jour [FR] ❌\n0 vies restantes 🖤🖤🖤🖤🖤");
  });
});
