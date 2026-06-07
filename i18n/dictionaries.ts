import type { Locale } from "@/lib/game/types";
import { fr, type Dictionary } from "./messages/fr";
import { en } from "./messages/en";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
