export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlMatches: process.env.SUPABASE_URL === process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) || "not set",
    },
    client: {
      canInitialize: false,
      error: null as string | null,
    },
  };

  try {
    const client = getSupabaseServer();
    // Try a simple query to verify client works
    const { error } = await client.from("apps").select("id").limit(1);
    diagnostics.client.canInitialize = true;
    if (error) {
      diagnostics.client.error = error.message;
    }
  } catch (error) {
    diagnostics.client.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}


