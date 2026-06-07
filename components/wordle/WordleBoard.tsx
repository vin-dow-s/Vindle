import type { GuessResult, LetterState } from "@/lib/game/types";

const STATE_CLASSES: Record<LetterState, string> = {
  correct: "bg-correct text-white border-correct",
  present: "bg-present text-ink border-present",
  absent: "bg-absent text-white border-absent",
};

function EvaluatedTile({
  letter,
  state,
  col,
}: {
  letter: string;
  state: LetterState;
  col: number;
}) {
  return (
    <div
      className={`tile-flip flex h-14 w-14 items-center justify-center rounded-[var(--radius-tile)] border-2 text-2xl font-bold uppercase ${STATE_CLASSES[state]}`}
      style={{ "--col": col } as React.CSSProperties}
    >
      {letter}
    </div>
  );
}

function InputTile({ letter }: { letter: string }) {
  return (
    <div
      // key on content so a freshly typed letter re-pops
      key={letter || "empty"}
      className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-tile)] border-2 text-2xl font-bold uppercase text-ink ${
        letter ? "animate-pop border-accent/70" : "border-edge"
      }`}
    >
      {letter}
    </div>
  );
}

export function WordleBoard({
  guesses,
  current,
  answerLength,
  maxAttempts,
  shake,
}: {
  guesses: GuessResult[];
  current: string;
  answerLength: number;
  maxAttempts: number;
  shake: boolean;
}) {
  const currentRow = guesses.length;

  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: maxAttempts }).map((_, row) => {
        const guess = guesses[row];
        const isCurrent = row === currentRow;
        return (
          <div
            key={row}
            className={`flex justify-center gap-1.5 [perspective:900px] ${
              isCurrent && shake ? "vindle-shake" : ""
            }`}
          >
            {Array.from({ length: answerLength }).map((_, col) => {
              if (guess) {
                return (
                  <EvaluatedTile
                    key={col}
                    col={col}
                    letter={guess.guess[col] ?? ""}
                    state={guess.states[col]}
                  />
                );
              }
              if (isCurrent) {
                return <InputTile key={col} letter={current[col] ?? ""} />;
              }
              return (
                <div
                  key={col}
                  className="h-14 w-14 rounded-[var(--radius-tile)] border-2 border-edge/60"
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
