import { notFound, redirect } from "next/navigation";
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
      <div className="animate-rise mt-2 rounded-[var(--radius-card)] border border-edge bg-card p-7">
        <h1 className="text-xl font-semibold text-ink">{dict.auth.loginTitle}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-soft">{dict.auth.loginSubtitle}</p>
        <LoginForm locale={locale} labels={dict.auth} />
      </div>
    </main>
  );
}
