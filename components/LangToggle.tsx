"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales } from "@/i18n/config";
import type { Locale } from "@/lib/game/types";

/**
 * FR | EN toggle that swaps the locale segment of the CURRENT path, so it works
 * on any page (e.g. /fr/leaderboard ↔ /en/leaderboard to see each language's
 * board).
 */
export function LangToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  const swap = (l: string) => {
    if (!pathname) return `/${l}`;
    const parts = pathname.split("/");
    parts[1] = l; // parts[0] === "" , parts[1] === current locale
    return parts.join("/") || `/${l}`;
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-edge bg-card/70 p-0.5 text-xs font-bold"
      aria-label="Language"
    >
      {locales.map((l) => (
        <Link
          key={l}
          href={swap(l)}
          aria-current={l === locale ? "page" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-[transform,color] active:scale-90 ${
            l === locale
              ? "bg-accent text-white"
              : "text-ink-soft hover:text-accent-strong"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
