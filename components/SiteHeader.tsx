import { Suspense } from "react";
import Link from "next/link";
import { House, SignIn, Trophy, UserCircle } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/lib/game/types";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";
import { getUser } from "@/lib/supabase/auth";
import { LangToggle } from "./LangToggle";
import { HelpModal } from "./HelpModal";

const linkCls =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong transition-[transform,color] duration-150 hover:text-accent active:scale-95";

/** Auth slot — streamed via Suspense so it never blocks the header/page. */
async function AuthNav({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["nav"];
}) {
  const user = await getUser();
  return user ? (
    <Link href={`/${locale}/account`} className={linkCls} aria-label={labels.profile}>
      <UserCircle size={17} weight="bold" />
      <span className="hidden sm:inline">{labels.profile}</span>
    </Link>
  ) : (
    <Link href={`/${locale}/login`} className={linkCls} aria-label={labels.login}>
      <SignIn size={17} weight="bold" />
      <span className="hidden sm:inline">{labels.login}</span>
    </Link>
  );
}

function AuthSkeleton() {
  return <span aria-hidden className="h-5 w-5 animate-pulse rounded-full bg-edge/70 sm:w-16" />;
}

/**
 * THE global header — rendered once in the locale layout, shown on every page.
 * Left: Leaderboard · How to play. Right: Home · Profile/Sign-in · Language.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="sticky top-0 z-30 w-full border-b border-edge/50 bg-[var(--bg)]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className={linkCls} aria-label={dict.nav.home}>
            <House size={17} weight="duotone" />
            <span className="hidden sm:inline">{dict.nav.home}</span>
          </Link>
          <Suspense fallback={<AuthSkeleton />}>
            <AuthNav locale={locale} labels={dict.nav} />
          </Suspense>
          <LangToggle locale={locale} />
        </div>
      </header>
    </div>
  );
}
