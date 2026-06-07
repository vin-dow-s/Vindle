import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getUser } from "@/lib/supabase/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getUser();
  if (user) redirect(`/${locale}/account`);

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
        <h1 className="font-title text-3xl leading-none text-accent-strong">
          {dict.appName}
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-ink">{dict.auth.loginTitle}</h2>
        <p className="mb-6 mt-1 text-sm text-ink-soft">{dict.auth.loginSubtitle}</p>
        <LoginForm locale={locale} labels={dict.auth} />
      </div>
    </main>
  );
}
