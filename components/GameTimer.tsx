"use client";

import { useEffect, useState } from "react";
import { Timer } from "@phosphor-icons/react";

/**
 * Small mm:ss stopwatch shown in the corner of a game card. Counts up while
 * `running`, otherwise shows the frozen final time.
 */
export function GameTimer({
  running,
  startAt,
  frozenMs,
}: {
  running: boolean;
  startAt: number;
  frozenMs: number;
}) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 500);
    return () => window.clearInterval(id);
  }, [running, startAt]);

  const ms = running && startAt ? Math.max(0, Date.now() - startAt) : frozenMs;
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = total % 60;

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-ink-soft">
      <Timer size={15} weight="bold" />
      {mm}:{String(ss).padStart(2, "0")}
    </span>
  );
}
