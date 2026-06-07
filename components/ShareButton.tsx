"use client";

import { useRef, useState } from "react";
import { Check, ShareNetwork } from "@phosphor-icons/react";

type Status = "idle" | "copied" | "manual";

/**
 * Shares the result. Tries, in order: the native share sheet (mobile), the
 * async Clipboard API, a legacy execCommand copy, and finally reveals the text
 * in a selectable field — so a blocked clipboard never silently dead-ends.
 */
export function ShareButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);

  const flash = () => {
    setStatus("copied");
    window.setTimeout(() => setStatus("idle"), 1600);
  };

  const onClick = async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        /Mobi|Android/i.test(navigator.userAgent)
      ) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        flash();
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) {
        flash();
        return;
      }
    } catch {
      /* fall through */
    }
    // Last resort: show the text so the user can copy it manually.
    setStatus("manual");
    window.setTimeout(() => textRef.current?.select(), 0);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-white shadow-[0_10px_24px_-12px_var(--accent)] transition-[transform,background-color] duration-150 hover:bg-accent-strong active:scale-95"
      >
        {status === "copied" ? (
          <Check size={18} weight="bold" />
        ) : (
          <ShareNetwork size={18} weight="bold" />
        )}
        {status === "copied" ? copiedLabel : label}
      </button>

      {status === "manual" && (
        <textarea
          ref={textRef}
          readOnly
          rows={3}
          value={text}
          aria-label={label}
          className="w-64 resize-none rounded-xl border border-edge bg-white/70 p-2 text-center text-xs text-ink"
        />
      )}
    </div>
  );
}
