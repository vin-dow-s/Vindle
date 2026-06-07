import { cache } from "react";
import { createClient } from "./server";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  is_premium: boolean;
}

/** The authenticated user (validated against Supabase), or null.
 *  Memoized per request so layout + page share a single auth round-trip. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The current user's profile row, or null if signed out. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, locale, is_premium")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
});
