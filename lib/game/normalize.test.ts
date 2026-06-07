import { describe, expect, it } from "vitest";
import { normalizeWord } from "./normalize";

describe("normalizeWord", () => {
  it("uppercases plain words", () => {
    expect(normalizeWord("crane")).toBe("CRANE");
  });

  it("strips French diacritics", () => {
    expect(normalizeWord("crêpe")).toBe("CREPE");
    expect(normalizeWord("élève")).toBe("ELEVE");
    expect(normalizeWord("garçon")).toBe("GARCON");
  });

  it("expands œ and æ ligatures", () => {
    expect(normalizeWord("œuf")).toBe("OEUF");
    expect(normalizeWord("nævus")).toBe("NAEVUS");
  });

  it("drops spaces, hyphens and apostrophes", () => {
    expect(normalizeWord("coral reef")).toBe("CORALREEF");
    expect(normalizeWord("arc-en-ciel")).toBe("ARCENCIEL");
    expect(normalizeWord("aujourd'hui")).toBe("AUJOURDHUI");
  });
});
