import { Backspace } from "@phosphor-icons/react";
import type { LetterState } from "@/lib/game/types";

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const STATE_CLASSES: Record<LetterState, string> = {
  correct: "bg-correct text-white border-correct",
  present: "bg-present text-ink border-present",
  absent: "bg-absent text-white border-absent",
};

export function Keyboard({
  onKey,
  keyStates,
  enterLabel,
}: {
  onKey: (key: string) => void;
  keyStates: Record<string, LetterState>;
  enterLabel: string;
}) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-1.5">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isAction = key === "ENTER" || key === "BACKSPACE";
            const state = keyStates[key];
            const tone =
              !isAction && state
                ? STATE_CLASSES[state]
                : "border-edge bg-white/70 text-ink hover:bg-accent-tint";
            return (
              <button
                key={key}
                type="button"
                tabIndex={-1}
                aria-label={key === "BACKSPACE" ? "Backspace" : key}
                onClick={() => onKey(key)}
                className={`flex h-12 items-center justify-center rounded-[var(--radius-tile)] border text-sm font-semibold uppercase transition-[transform,background-color,color] duration-100 active:scale-90 ${
                  isAction ? "px-3.5 text-xs" : "w-8 sm:w-10"
                } ${tone}`}
              >
                {key === "BACKSPACE" ? (
                  <Backspace size={20} weight="bold" />
                ) : key === "ENTER" ? (
                  enterLabel
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
