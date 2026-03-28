import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseAdmin() {
  return createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabasePublicServer() {
  return createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
