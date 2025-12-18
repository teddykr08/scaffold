import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or Public Key");
  }

  return createClient(url, key);
}

// Deprecated: Use getSupabaseClient() inside handlers to avoid build-time crashes on Vercel
// export const supabase = getSupabaseClient();
