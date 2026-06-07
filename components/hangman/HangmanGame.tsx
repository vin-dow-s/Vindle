"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Heart, Star, X } from "@phosphor-icons/react";
import type { Locale } from "@/lib/game/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { WordEntry } from "@/lib/words/types";
import {
  createHangmanState,
  guessLetter,
  isRevealed,
  letterOutcome,
  remainingLives,
} from "@/lib/game/hangman";
import { normalizeWord } from "@/lib/game/normalize";
import { hangmanScore } from "@/lib/game/score";
import { hangmanShareText } from "@/lib/game/share";
import { ShareButton } from "@/components/ShareButton";
import { GameTimer } from "@/components/GameTimer";

type Labels = Dictionary["dailyPlay"];

const QWERTY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];
const MAX_MISTAKES = 5; // original Vindle

type SavedGame = {
  answer: string;
  guessed: string[];
  mistakes: number;
  status: "won" | "lost";
  timeMs: number;
  synced: boolean;
};

export function HangmanGame({
  entry,
  labels,
  rules,
  locale,
  isAuthed,
}: {
  entry: WordEntry;
  labels: Labels;
  rules: string;
  locale: Locale;
  isAuthed: boolean;
}) {
  const [state, setState] = useState(() =>
    createHangmanState(entry.word, { maxMistakes: MAX_MISTAKES }),
  );
  const [lastGuess, setLastGuess] = useState<string | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [resultTimeMs, setResultTimeMs] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const finished = state.status !== "in_progress";
  const startRef = useRef(0);
  const timeRef = useRef(0);
  const syncedRef = useRef(false);
  const savedRef = useRef(false);

  const storageKey = useMemo(
    () => `vindle-daily-${locale}-${new Date().toISOString().slice(0, 10)}`,
    [locale],
  );

  // On day/word change: restore today's finished game from localStorage, or
  // start fresh. The daily can only be played once per day.
  useEffect(() => {
    const answer = normalizeWord(entry.word);
    let restored: SavedGame | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw) as SavedGame;
        if (
          data?.answer === answer &&
          (data.status === "won" || data.status === "lost")
        ) {
          restored = data;
        }
      }
    } catch {
      /* ignore */
    }

    if (restored) {
      setState({
        answer,
        guessed: restored.guessed ?? [],
        mistakes: restored.mistakes ?? 0,
        maxMistakes: MAX_MISTAKES,
        status: restored.status,
      });
      setResultTimeMs(restored.timeMs ?? 0);
      setAlreadyPlayed(true);
      timeRef.current = restored.timeMs ?? 0;
      syncedRef.current = restored.synced ?? false;
      savedRef.current = true;
    } else {
      setState(createHangmanState(entry.word, { maxMistakes: MAX_MISTAKES }));
      setResultTimeMs(0);
      setAlreadyPlayed(false);
      timeRef.current = 0;
      syncedRef.current = false;
      savedRef.current = false;
      const now = Date.now();
      startRef.current = now;
      setStartedAt(now);
    }
    setLastGuess(null);
  }, [entry.word, storageKey]);

  // On a fresh finish: persist the result (so the day is locked) + record time.
  useEffect(() => {
    if (state.status === "in_progress" || savedRef.current) return;
    savedRef.current = true;
    const timeMs = Date.now() - startRef.current;
    timeRef.current = timeMs;
    setResultTimeMs(timeMs);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          answer: state.answer,
          guessed: state.guessed,
          mistakes: state.mistakes,
          status: state.status,
          timeMs,
          synced: syncedRef.current,
        } satisfies SavedGame),
      );
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, storageKey]);

  // Save the ranked result to the DB when finished + signed in. Runs for a
  // fresh win AND "after the fact": play as a guest, sign in later, and
  // returning to the daily syncs the stored result.
  useEffect(() => {
    if (state.status === "in_progress" || !isAuthed || syncedRef.current) return;
    syncedRef.current = true; // optimistic
    fetch("/api/daily-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "daily",
        locale,
        success: state.status === "won",
        attempts: state.mistakes,
        timeMs: timeRef.current,
      }),
    })
      .then((r) => {
        if (!r.ok) {
          syncedRef.current = false;
          return;
        }
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const data = JSON.parse(raw);
            data.synced = true;
            localStorage.setItem(storageKey, JSON.stringify(data));
          }
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        syncedRef.current = false;
      });
  }, [state.status, state.mistakes, isAuthed, locale, storageKey]);

  const tryLetter = useCallback((letter: string) => {
    const L = normalizeWord(letter);
    if (L.length !== 1) return;
    setState((prev) =>
      prev.status === "in_progress" && !prev.guessed.includes(L)
        ? guessLetter(prev, L)
        : prev,
    );
    setLastGuess(L);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      tryLetter(e.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tryLetter]);

  // Falling purple hearts on a FRESH win (not when revisiting a finished game).
  useEffect(() => {
    if (state.status !== "won" || alreadyPlayed) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const make = () => {
      const heart = document.createElement("img");
      heart.src = "/heart.png";
      heart.alt = "";
      heart.setAttribute("aria-hidden", "true");
      heart.className = "heart";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.setProperty("--rot-start", Math.round(Math.random() * 80 - 40) + "deg");
      heart.style.setProperty("--rot-end", Math.round(Math.random() * 140 - 70) + "deg");
      const dur = Math.random() * 1.5 + 1.4;
      heart.style.animationDuration = dur + "s";
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), dur * 1000);
    };
    const id = window.setInterval(make, 100);
    const stop = window.setTimeout(() => window.clearInterval(id), 3000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [state.status, alreadyPlayed]);

  const lives = remainingLives(state);
  const lastHit = lastGuess ? state.answer.includes(lastGuess) : null;
  const score = finished
    ? hangmanScore({
        success: state.status === "won",
        mistakes: state.mistakes,
        maxMistakes: MAX_MISTAKES,
        timeMs: resultTimeMs,
      })
    : 0;

  // Keep a single word on ONE line: shrink the slots for longer words on
  // mobile, restored to full size from the sm breakpoint up (desktop has room).
  const letterCount = entry.word
    .split("")
    .filter((c) => normalizeWord(c).length > 0).length;
  const blankSize =
    letterCount <= 7
      ? "h-10 w-7 text-2xl"
      : letterCount <= 9
        ? "h-9 w-6 text-xl"
        : letterCount <= 11
          ? "h-8 w-5 text-lg"
          : "h-8 w-4 text-base";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-strong transition-[transform,color] duration-150 hover:text-accent active:scale-95"
      >
        <ArrowLeft size={16} weight="bold" />
        {labels.back}
      </Link>
      <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">{labels.title}</h1>

      <div className="animate-rise relative mt-3 rounded-[var(--radius-card)] border border-edge bg-card px-6 pb-10 pt-7 text-center sm:px-10">
        <div className="absolute right-4 top-4 sm:right-6">
          <GameTimer running={!finished} startAt={startedAt} frozenMs={resultTimeMs} />
        </div>

        {/* Hint */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-strong">
          {labels.clue}
        </p>
        <p className="mx-auto mt-2 max-w-md text-balance text-lg leading-snug text-ink">
          {entry.definition}
        </p>

        {/* Lives as hearts */}
        <div
          className="mt-6 flex items-center justify-center gap-1.5"
          role="img"
          aria-label={`${labels.chancesLeft}: ${lives}`}
        >
          {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
            <Heart
              key={i}
              size={22}
              weight={i < lives ? "fill" : "regular"}
              className={i < lives ? "text-accent" : "text-edge"}
            />
          ))}
        </div>

        {/* Word blanks */}
        <div className="mt-8 flex flex-nowrap items-end justify-center gap-x-1 sm:gap-x-2.5">
          {entry.word.split("").map((char, i) => {
            const sep = normalizeWord(char).length === 0;
            if (sep) return <span key={i} className="w-3" />;
            const revealed = isRevealed(state, char);
            const missed =
              state.status === "lost" && !state.guessed.includes(normalizeWord(char));
            return (
              <span
                key={`${i}-${revealed}`}
                className={`flex ${blankSize} shrink-0 items-end justify-center border-b-2 pb-1 font-bold uppercase sm:h-10 sm:w-7 sm:text-2xl ${
                  revealed ? "animate-pop" : ""
                } ${missed ? "border-danger text-danger" : "border-edge text-ink"}`}
              >
                {revealed ? char : " "}
              </span>
            );
          })}
        </div>

        {/* Feedback / result */}
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex h-7 items-center justify-center text-sm font-semibold"
        >
          {state.status === "won" ? (
            <span className="text-correct">{labels.won}</span>
          ) : state.status === "lost" ? (
            <span className="text-ink-soft">
              {labels.lost}{" "}
              <span className="text-ink">
                {labels.answerWas} <span className="font-bold">{entry.word}</span>
              </span>
            </span>
          ) : lastGuess ? (
            <span
              className={`inline-flex items-center gap-1.5 ${
                lastHit ? "text-correct" : "text-danger"
              }`}
            >
              {lastHit ? <Check size={16} weight="bold" /> : <X size={16} weight="bold" />}
              {lastHit ? labels.correctLetter : labels.incorrectLetter}
            </span>
          ) : null}
        </div>

        {finished ? (
          /* Locked / completed view */
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-4 py-1.5 text-base font-bold text-accent-strong">
              <Star size={16} weight="fill" />
              {score}
            </div>
            <ShareButton
              text={hangmanShareText(state, {
                title: labels.title,
                livesLabel: labels.livesLeft.toLowerCase(),
              })}
              label={labels.share}
              copiedLabel={labels.copied}
            />
            {!isAuthed && (
              <Link
                href={`/${locale}/login`}
                className="text-xs font-semibold text-accent-strong hover:underline"
              >
                {labels.signInToSave}
              </Link>
            )}
            <p className="max-w-xs text-xs text-ink-faint">{labels.comeBack}</p>
          </div>
        ) : (
          /* QWERTY letter picker */
          <div className="mx-auto mt-3 flex w-full max-w-lg flex-col gap-1.5">
            {QWERTY_ROWS.map((row, i) => (
              <div key={i} className="flex justify-center gap-1.5">
                {row.map((letter) => {
                  const outcome = letterOutcome(state, letter);
                  const tone =
                    outcome === "hit"
                      ? "bg-correct text-white border-correct"
                      : outcome === "miss"
                        ? "bg-absent text-white border-absent"
                        : "border-edge bg-white/70 text-ink hover:bg-accent-tint";
                  return (
                    <button
                      key={letter}
                      type="button"
                      tabIndex={-1}
                      disabled={outcome !== "unused"}
                      onClick={() => tryLetter(letter)}
                      className={`flex h-12 w-8 items-center justify-center rounded-[var(--radius-tile)] border text-sm font-normal transition-[transform,background-color,color] duration-100 active:scale-90 disabled:cursor-default sm:w-10 ${tone}`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

      </div>

      <p className="mt-4 px-1 text-sm leading-relaxed text-ink-soft">{rules}</p>
    </main>
  );
}
