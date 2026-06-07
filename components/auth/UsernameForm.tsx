"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";

const USERNAME_RE = /^[A-Za-z0-9_-]{3,20}$/;

type Status = "idle" | "saved" | "taken" | "invalid" | "error";

export function UsernameForm({
  userId,
  initial,
  labels,
}: {
  userId: string;
  initial: string | null;
  labels: Dictionary["auth"];
}) {
  const [username, setUsername] = useState(initial ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    if (!USERNAME_RE.test(clean)) {
      setStatus("invalid");
      return;
    }
    setLoading(true);
    setStatus("idle");
    const { error } = await supabase
      .from("profiles")
      .update({ username: clean })
      .eq("id", userId);
    setLoading(false);
    if (!error) {
      setStatus("saved");
      router.refresh();
    } else if (error.code === "23505") {
      setStatus("taken");
    } else {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-2.5">
      <label htmlFor="username" className="text-sm font-semibold text-ink">
        {labels.username}
      </label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={labels.usernamePlaceholder}
        autoCapitalize="none"
        autoComplete="off"
        className="rounded-xl border border-edge bg-white/70 px-4 py-2.5 text-ink outline-none transition-colors focus:border-accent"
        aria-describedby="username-hint"
      />
      <p id="username-hint" className="text-xs text-ink-faint">
        {labels.usernameHint}
      </p>
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {labels.saveUsername}
      </button>
      {status === "saved" && <p className="text-sm font-medium text-correct">{labels.usernameSaved}</p>}
      {status === "taken" && <p className="text-sm font-medium text-danger">{labels.usernameTaken}</p>}
      {status === "invalid" && <p className="text-sm font-medium text-danger">{labels.usernameInvalid}</p>}
      {status === "error" && <p className="text-sm font-medium text-danger">{labels.errorGeneric}</p>}
    </form>
  );
}
