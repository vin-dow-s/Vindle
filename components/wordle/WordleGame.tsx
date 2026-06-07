"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";
import type { Locale } from "@/lib/game/types";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  applyGuess,
  createWordleState,
  DEFAULT_WORDLE_CONFIG,
  letterStatuses,
} from "@/lib/game/wordle";
import { normalizeWord } from "@/lib/game/normalize";
import { wordleShareText } from "@/lib/game/share";
import { ShareButton } from "@/components/ShareButton";
import { WordleBoard } from "./WordleBoard";
import { Keyboard } from "./Keyboard";

type WordleLabels = Dictionary["wordle"];

export function WordleGame({
  answer,
  locale,
  labels,
  backHref,
}: {
  answer: string;
  locale: Locale;
  labels: WordleLabels;
  backHref: string;
}) {
  const router = useRouter();
  const config = DEFAULT_WORDLE_CONFIG;

  const [state, setState] = useState(() => createWordleState(config));
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validWords, setValidWords] = useState<Set<string> | null>(null);

  const finished = state.status !== "in_progress";
  const keyStates = useMemo(() => letterStatuses(state.guesses), [state.guesses]);

  useEffect(() => {
    setState(createWordleState(config));
    setCurrent("");
    setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

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

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-strong transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} weight="bold" />
        {labels.back}
      </Link>

      <div className="animate-rise mt-4 rounded-[var(--radius-card)] border border-edge bg-card px-5 py-7 text-center sm:px-8">
        <h1 className="sr-only">{labels.title}</h1>
        <p
          aria-hidden
          className="font-title text-4xl leading-none text-accent-strong"
        >
          Vindle
        </p>
        <p className="mb-6 mt-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
          {labels.practiceNote}
        </p>

        <div className="flex flex-col items-center gap-6">
          <WordleBoard
            guesses={state.guesses}
            current={current}
            answerLength={config.answerLength}
            maxAttempts={config.maxAttempts}
            shake={shake}
          />

          <div
            role="status"
            aria-live="polite"
            className="h-6 text-sm font-semibold"
          >
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
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ShareButton
                text={wordleShareText(state, { title: labels.title })}
                label={labels.share}
                copiedLabel={labels.copied}
              />
              <button
                type="button"
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-2.5 font-semibold text-ink transition-[transform,background-color] duration-150 hover:bg-accent-tint active:scale-95"
              >
                <ArrowsClockwise size={18} weight="bold" />
                {labels.playAgain}
              </button>
            </div>
          ) : (
            <Keyboard onKey={press} keyStates={keyStates} enterLabel={labels.enter} />
          )}
        </div>
      </div>
    </main>
  );
}
