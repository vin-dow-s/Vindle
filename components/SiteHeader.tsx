import { Suspense } from "react";
import Link from "next/link";
import { SignIn, Trophy, UserCircle } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/lib/game/types";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { getProfile } from "@/lib/supabase/auth";
import { LangToggle } from "./LangToggle";
import { HelpModal } from "./HelpModal";

const linkCls =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong transition-[transform,color] duration-150 hover:text-accent active:scale-95";

/** Auth slot — streamed via Suspense so it never blocks the header/page.
 *  Shows the username (not "Profile") once signed in. */
async function AuthNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["nav"];
}) {
  const profile = await getProfile();
  return profile ? (
    <Link href={`/${locale}/account`} className={linkCls} aria-label={labels.profile}>
      <UserCircle size={17} weight="bold" />
      <span className="hidden max-w-[8rem] truncate sm:inline">
        {profile.username || profile.display_name || labels.profile}
      </span>
    </Link>
  ) : (
    <Link href={`/${locale}/login`} className={linkCls} aria-label={labels.login}>
      <SignIn size={17} weight="bold" />
      <span className="hidden sm:inline">{labels.login}</span>
    </Link>
  );
}

function AuthSkeleton() {
  return <span aria-hidden className="h-5 w-5 animate-pulse rounded-full bg-edge/70 sm:w-20" />;
}

/**
 * THE global header — rendered once in the locale layout, shown on every page.
 * Left: Vindle wordmark (→ home). Center: Leaderboard · How to play.
 * Right: Language · Profile/username.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="sticky top-0 z-30 w-full border-b border-edge/50 bg-[var(--bg)]">
      <header className="mx-auto grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-3">
        {/* Left — wordmark → home */}
        <Link
          href={`/${locale}`}
          aria-label={dict.appName}
          className="font-title justify-self-start text-3xl leading-none text-accent-strong transition-transform duration-150 active:scale-95"
        >
          {dict.appName}
        </Link>

        {/* Center — leaderboard · how to play */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/${locale}/leaderboard`}
            className={linkCls}
            aria-label={dict.nav.leaderboard}
          >
            <Trophy size={17} weight="duotone" />
            <span className="hidden sm:inline">{dict.nav.leaderboard}</span>
          </Link>
          <HelpModal labels={dict.help} />
        </div>

        {/* Right — language · profile */}
        <div className="flex items-center justify-end gap-3">
          <LangToggle locale={locale} />
          <Suspense fallback={<AuthSkeleton />}>
            <AuthNav locale={locale} labels={dict.nav} />
          </Suspense>
        </div>
      </header>
    </div>
  );
}
