"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/game/types";

/**
 * The root <html> lives in the root layout (which can't read the locale param),
 * so we sync `lang` on the client per locale. Renders nothing.
 */
export function HtmlLangSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
