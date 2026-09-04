import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY. Uses the service_role key, which bypasses Row Level Security.
 * Only import this from Server Components / Route Handlers that run on the
 * server (never from a Client Component, never expose this key with a
 * NEXT_PUBLIC_ prefix). It exists solely so the public, no-login
 * /quote/[token] page can read a single quote by its token.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
