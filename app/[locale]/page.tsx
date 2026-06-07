import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GridNine, Heart } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Decorative drifting hearts (behind content, non-interactive).
const FLOAT_HEARTS = [
  { top: "18%", left: "5%", size: 60, opacity: 0.1, d: "8s", delay: "0s", r: "-12deg" },
  { top: "10%", right: "12%", size: 46, opacity: 0.12, d: "6.5s", delay: "0.6s", r: "10deg" },
  { top: "55%", right: "7%", size: 74, opacity: 0.08, d: "9s", delay: "0.3s", r: "16deg" },
  { bottom: "14%", left: "11%", size: 52, opacity: 0.1, d: "7.5s", delay: "1s", r: "-8deg" },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="relative mx-auto w-full max-w-3xl flex-1 overflow-hidden px-5 pb-16 pt-6">
      {/* Ambient hearts */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FLOAT_HEARTS.map((h, i) => (
          <Heart
            key={i}
            weight="fill"
            size={h.size}
            className="float-heart absolute text-accent"
            style={
              {
                top: h.top,
                left: h.left,
                right: h.right,
                bottom: h.bottom,
                opacity: h.opacity,
                "--d": h.d,
                "--delay": h.delay,
                "--r": h.r,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <header className="mt-4 sm:mt-6">
          <h1
            className="animate-rise font-title text-[clamp(2.5rem,8.5vw,4.25rem)] leading-[0.85] text-accent-strong"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            Vindle
          </h1>
          <p
            className="animate-rise mt-2 max-w-md text-base text-ink-soft"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {dict.tagline}
          </p>
        </header>

        {/* Featured card — "Mot du jour" owns the page */}
        <Link
          href={`/${locale}/play/daily`}
          style={{ "--i": 2 } as React.CSSProperties}
          className="animate-rise group relative mt-8 block overflow-hidden rounded-[var(--radius-card)] bg-accent-strong p-7 text-white shadow-[0_28px_60px_-30px_var(--accent)] transition-transform duration-[260ms] [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-1 active:scale-[0.985] sm:p-9"
        >
          <Heart
            aria-hidden
            weight="fill"
            size={230}
            className="absolute -bottom-12 -right-8 text-white/10 transition-transform duration-500 [transition-timing-function:var(--ease-out-quart)] group-hover:scale-110"
          />
          <div className="relative">
            <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
              {dict.home.newBadge}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              {dict.home.daily.title}
            </h2>
            <p className="mt-2 max-w-sm leading-relaxed text-white/85">
              {dict.home.daily.desc}
            </p>
            <div className="mt-7 inline-flex items-center gap-2 font-semibold">
              {dict.nav.play}
              <ArrowRight
                size={18}
                weight="bold"
                className="transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1.5"
              />
            </div>
          </div>
        </Link>

        {/* Secondary card — Wordle, deliberately narrower (asymmetry) */}
        <Link
          href={`/${locale}/play/wordle`}
          style={{ "--i": 3 } as React.CSSProperties}
          className="animate-rise group mt-4 block rounded-[var(--radius-card)] border border-edge bg-card p-6 transition-all duration-[260ms] [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-1 hover:border-accent active:scale-[0.985] sm:max-w-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {dict.home.wordle.title}
            </h2>
            <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-strong">
              {dict.home.newBadge}
            </span>
          </div>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-soft">
            {dict.home.wordle.desc}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-strong">
            <GridNine size={18} weight="duotone" />
            {dict.nav.play}
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform duration-200 [transition-timing-function:var(--ease-out-quart)] group-hover:translate-x-1"
            />
          </div>
        </Link>
      </div>
    </main>
  );
}
