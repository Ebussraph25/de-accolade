export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
/** True when the CMS/database is configured. Without it the public site runs on sample content. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
