import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (uses the public anon key + RLS).
 * Call from Client Components only.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

/** Whether Supabase env vars are configured. Lets the app degrade gracefully. */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
