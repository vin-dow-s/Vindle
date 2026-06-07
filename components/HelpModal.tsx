"use client";

import { useRef } from "react";
import { Question, X } from "@phosphor-icons/react";
import type { Dictionary } from "@/i18n/dictionaries";

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
        {title}
      </h3>
      <p className="mt-1 leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

export function HelpModal({ labels }: { labels: Dictionary["help"] }) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={labels.title}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong transition-[transform,color] duration-150 hover:text-accent active:scale-90"
      >
        <Question size={17} weight="bold" />
        <span className="hidden sm:inline">{labels.title}</span>
      </button>

      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] border border-edge bg-card p-0 text-ink backdrop:bg-[#1e1b2e]/40"
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{labels.title}</h2>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label={labels.close}
              className="text-ink-faint transition-colors hover:text-ink"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-4 text-sm">
            <Section title={labels.dailyTitle} body={labels.dailyBody} />
            <Section title={labels.wordleTitle} body={labels.wordleBody} />
            <Section title={labels.scoreTitle} body={labels.scoreBody} />
            <Section title={labels.boardTitle} body={labels.boardBody} />
          </div>
        </div>
      </dialog>
    </>
  );
}
