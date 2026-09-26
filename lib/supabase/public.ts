import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";

let client: SupabaseClient | null = null;

/**
 * Cookie-less anon client for public reads. Because it never touches cookies,
 * pages that use it stay statically cacheable (ISR) on Vercel.
 */
export function publicClient() {
  if (!hasSupabase) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
