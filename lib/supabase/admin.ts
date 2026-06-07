import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — BYPASSES Row Level Security.
 *
 * Server-only. Used exclusively for trusted, validated writes (e.g. inserting
 * a ranked `game_results` row AFTER the server has checked the guess against
 * the real answer). Never import this from client code.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
