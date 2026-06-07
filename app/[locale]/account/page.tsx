import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, SignOut, Trophy } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getProfile } from "@/lib/supabase/auth";
import { UsernameForm } from "@/components/auth/UsernameForm";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const profile = await getProfile();
  if (!profile) redirect(`/${locale}/login`);

  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-strong transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} weight="bold" />
        {dict.nav.home}
      </Link>

      <div className="animate-rise mt-6 rounded-[var(--radius-card)] border border-edge bg-card p-7">
        <h1 className="text-xl font-semibold text-ink">{dict.auth.accountTitle}</h1>
        {!profile.username && (
          <p className="mt-1 text-sm font-medium text-accent-strong">
            {dict.auth.needUsername}
          </p>
        )}

        <div className="mt-5">
          <UsernameForm
            userId={profile.id}
            initial={profile.username}
            labels={dict.auth}
          />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-edge pt-5">
          <Link
            href={`/${locale}/leaderboard`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-strong transition-colors hover:text-accent"
          >
            <Trophy size={16} weight="duotone" />
            {dict.nav.leaderboard}
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-danger"
            >
              <SignOut size={16} weight="bold" />
              {dict.auth.signOut}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
