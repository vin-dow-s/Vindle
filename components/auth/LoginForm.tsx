"use client";

import { useState } from "react";
import { EnvelopeSimple, GoogleLogo } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/lib/game/types";

export function LoginForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["auth"];
}) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/${locale}/account`)}`;

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo() },
    });
    setLoading(false);
    if (error) setError(labels.errorGeneric);
    else setSent(true);
  };

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setError(labels.errorGeneric);
  };

  if (sent) {
    return (
      <p className="rounded-xl border border-edge bg-accent-tint p-4 text-sm font-medium text-accent-strong">
        {labels.magicLinkSent}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={sendMagicLink} className="flex flex-col gap-2.5">
        <label htmlFor="email" className="text-sm font-semibold text-ink">
          {labels.email}
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-edge bg-white/70 px-4 py-2.5 text-ink outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          <EnvelopeSimple size={18} weight="bold" />
          {labels.sendMagicLink}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
        <span className="h-px flex-1 bg-edge" />
        {labels.orSeparator}
        <span className="h-px flex-1 bg-edge" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-edge bg-white/70 px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-accent-tint"
      >
        <GoogleLogo size={18} weight="bold" />
        {labels.google}
      </button>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}
