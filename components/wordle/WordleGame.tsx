"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "@phosphor-icons/react";
import type { GuessResult, Locale } from "@/lib/game/types";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  applyGuess,
  createWordleState,
  DEFAULT_WORDLE_CONFIG,
  letterStatuses,
} from "@/lib/game/wordle";
import { normalizeWord } from "@/lib/game/normalize";
import { wordleScore } from "@/lib/game/score";
import { wordleShareText } from "@/lib/game/share";
import { ShareButton } from "@/components/ShareButton";
import { GameTimer } from "@/components/GameTimer";
import { EndGameRank } from "@/components/EndGameRank";
import { WordleBoard } from "./WordleBoard";
import { Keyboard } from "./Keyboard";

type Labels = Dictionary["wordle"];

type SavedGame = {
  answer: string;
  guesses: GuessResult[];
  status: "won" | "lost";
  timeMs: number;
  synced: boolean;
};

type ServerResult = {
  success: boolean;
  attempts: number;
  time_ms: number | null;
} | null;

export function WordleGame({
  answer,
  locale,
  labels,
  rules,
  isAuthed,
  serverResult,
}: {
  answer: string;
  locale: Locale;
  labels: Labels;
  rules: string;
  isAuthed: boolean;
  serverResult: ServerResult;
}) {
  const config = DEFAULT_WORDLE_CONFIG;

  const [state, setState] = useState(() => createWordleState(config));
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validWords, setValidWords] = useState<Set<string> | null>(null);
  const [resultTimeMs, setResultTimeMs] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const startRef = useRef(0);
  const timeRef = useRef(0);
  const syncedRef = useRef(false);
  const savedRef = useRef(false);

  const finished = state.status !== "in_progress";
  const keyStates = useMemo(() => letterStatuses(state.guesses), [state.guesses]);

  const storageKey = useMemo(
    () => `vindle-wordle-${locale}-${new Date().toISOString().slice(0, 10)}`,
    [locale],
  );

  // On day/word change: restore today's finished game, or start fresh.
  useEffect(() => {
    const normalized = normalizeWord(answer);
    let restored: SavedGame | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw) as SavedGame;
        if (
          data?.answer === normalized &&
          (data.status === "won" || data.status === "lost")
        ) {
          restored = data;
        }
      }
    } catch {
      /* ignore */
    }

    if (restored) {
      setState({ ...config, guesses: restored.guesses ?? [], status: restored.status });
      setResultTimeMs(restored.timeMs ?? 0);
      timeRef.current = restored.timeMs ?? 0;
      syncedRef.current = restored.synced ?? false;
      savedRef.current = true;
    } else if (serverResult) {
      // This account already played today (on another device) — lock it.
      setState({ ...config, guesses: [], status: serverResult.success ? "won" : "lost" });
      setResultTimeMs(serverResult.time_ms ?? 0);
      timeRef.current = serverResult.time_ms ?? 0;
      syncedRef.current = true;
      savedRef.current = true;
    } else {
      setState(createWordleState(config));
      setResultTimeMs(0);
      timeRef.current = 0;
      syncedRef.current = false;
      savedRef.current = false;
      const now = Date.now();
      startRef.current = now;
      setStartedAt(now);
    }
    setCurrent("");
    setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, storageKey]);

  // Load the validation dictionary once per locale.
  useEffect(() => {
    let cancelled = false;
    fetch(`/valid-guesses.${locale}.txt`)
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (cancelled || !text) return;
        setValidWords(new Set(text.split(/\r?\n/).filter(Boolean)));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locale]);

  // On a fresh finish: lock the day in localStorage.
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
          answer: normalizeWord(answer),
          guesses: state.guesses,
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

  // Submit the ranked result (fresh win or "after the fact" once signed in).
  useEffect(() => {
    if (state.status === "in_progress" || !isAuthed || syncedRef.current) return;
    syncedRef.current = true;
    fetch("/api/daily-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "wordle",
        locale,
        success: state.status === "won",
        attempts: state.guesses.length,
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
  }, [state.status, isAuthed, locale, storageKey]);

  const triggerShake = useCallback(() => {
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  }, []);

  const submit = useCallback(() => {
    if (finished) return;
    if (current.length < config.answerLength) {
      setMessage(labels.tooShort);
      triggerShake();
      return;
    }
    if (validWords && !validWords.has(current) && current !== normalizeWord(answer)) {
      setMessage(labels.notAWord);
      triggerShake();
      return;
    }
    setState((s) => applyGuess(s, current, answer));
    setCurrent("");
    setMessage(null);
  }, [
    finished,
    current,
    config.answerLength,
    labels.tooShort,
    labels.notAWord,
    triggerShake,
    answer,
    validWords,
  ]);

  const press = useCallback(
    (key: string) => {
      if (finished) return;
      if (key === "ENTER") return submit();
      if (key === "BACKSPACE") {
        setCurrent((c) => c.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key)) {
        setCurrent((c) => (c.length < config.answerLength ? c + key : c));
      }
    },
    [finished, submit, config.answerLength],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("BACKSPACE");
      else if (e.key.length === 1) {
        const up = normalizeWord(e.key);
        if (up.length === 1) press(up);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [press]);

  // Account already played today (synced from another device): we have the
  // result but not the guesses, so hide the board/share.
  const remoteOnly = finished && state.guesses.length === 0;
  const score = finished
    ? wordleScore({
        success: state.status === "won",
        attempts: remoteOnly ? (serverResult?.attempts ?? 0) : state.guesses.length,
        maxAttempts: config.maxAttempts,
        timeMs: resultTimeMs,
      })
    : 0;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-strong transition-[transform,color] duration-150 hover:text-accent active:scale-95"
      >
        <ArrowLeft size={16} weight="bold" />
        {labels.back}
      </Link>
      <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">{labels.title}</h1>

      <div className="animate-rise relative mt-3 rounded-[var(--radius-card)] border border-edge bg-card px-5 py-7 text-center sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6">
          <GameTimer running={!finished} startAt={startedAt} frozenMs={resultTimeMs} />
        </div>
        <p className="mb-6 hidden text-xs font-medium uppercase tracking-wide text-ink-faint sm:block">
          {labels.dailyNote}
        </p>

        <div className="mt-4 flex flex-col items-center gap-2 sm:mt-0 sm:gap-6">
          {!remoteOnly && (
            <WordleBoard
              guesses={state.guesses}
              current={current}
              answerLength={config.answerLength}
              maxAttempts={config.maxAttempts}
              shake={shake}
            />
          )}

          <div role="status" aria-live="polite" className="h-6 text-sm font-semibold">
            {finished ? (
              <span className={state.status === "won" ? "text-correct" : "text-danger"}>
                {state.status === "won"
                  ? labels.won
                  : `${labels.lost} · ${labels.answerWas} ${answer}`}
              </span>
            ) : (
              <span className="text-danger">{message}</span>
            )}
          </div>

          {finished ? (
            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-4 py-1.5 text-base font-bold text-accent-strong">
                <Star size={16} weight="fill" />
                {score}
              </div>
              <EndGameRank
                mode="wordle"
                locale={locale}
                score={score}
                claimLabel={labels.claimSpot}
              />
              {!remoteOnly && (
                <ShareButton
                  text={wordleShareText(state, { title: labels.title, locale })}
                  label={labels.share}
                  copiedLabel={labels.copied}
                />
              )}
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
            <Keyboard onKey={press} keyStates={keyStates} enterLabel={labels.enter} />
          )}
        </div>
      </div>

      <p className="mt-4 px-1 text-sm leading-relaxed text-ink-soft">{rules}</p>
    </main>
  );
}
