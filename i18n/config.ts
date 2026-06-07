import type { Locale } from "@/lib/game/types";

export const locales: Locale[] = ["fr", "en"];
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as string[]).includes(value);
}
