import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.warn(
    "Supabase env vars not set. Session saving and teacher dashboard will be disabled until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured in Vercel.",
  );
}

export const supabaseServer: SupabaseClient | null =
  url && serviceRoleKey
    ? createClient(url, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function isSupabaseConfigured(): boolean {
  return supabaseServer !== null;
}
