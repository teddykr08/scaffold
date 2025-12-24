import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Cache the client instance
let supabaseServerInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase server client with service role key.
 * This is lazy-loaded to ensure environment variables are available.
 */
export function getSupabaseServer(): SupabaseClient {
  // Return cached instance if already created
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  // 🚨 Build Phase Guard: Vercel does not expose secrets during build.
  // We must not attempt to initialize the client if the key is missing.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (!serviceRoleKey) {
    if (isBuildPhase) {
      console.log("[Scaffold] Skipping Supabase client initialization during build: missing service role key.");
      return null as any;
    }
    throw new Error(
      "[Scaffold] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
      "Verify it is set in your environment (e.g., Vercel Dashboard or .env.local)."
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("[Scaffold] Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.");
  }

  // No logging of keys or sensitive info
  if (!isBuildPhase && process.env.NODE_ENV === 'development') {
    console.log("[Scaffold] Initializing Supabase server client");
  }

  supabaseServerInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: "public",
    },
  });

  return supabaseServerInstance;
}
