export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/apps - List all apps for the current user
export async function GET(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();

    // Get the authorization token from the header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch apps for this user
    const { data, error } = await supabaseServer
      .from("apps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Scaffold] Supabase select error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "apps",
        operation: "select",
      });

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      apps: data || [],
    });
  } catch (error) {
    console.error("[Scaffold] Route error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Missing") && error.message.includes("environment variable")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            hint: "Check your .env.local file has all required variables. See .env.local.example for reference.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/apps - Create a new app for the current user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Missing name" },
        { status: 400 }
      );
    }

    // Get server client (lazy-loaded with service role key)
    const supabaseServer = getSupabaseServer();

    // Get the authorization token from the header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user from token
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseServer
      .from("apps")
      .insert([{ name, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("[Scaffold] Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        table: "apps",
        operation: "insert",
      });

      // Provide more helpful error messages
      if (error.code === "42501" || error.message?.includes("permission denied")) {
        return NextResponse.json(
          {
            success: false,
            error: "RLS policy error - service role key may not be configured correctly",
            details: error.message,
            diagnostic: "If you see this error, the service role key is not bypassing RLS. Check: 1) SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local, 2) Key matches the one from Supabase dashboard (Settings > API > service_role key)",
            hint: "Verify SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, app: data });
  } catch (error) {
    console.error("[Scaffold] Route error:", error);

    if (error instanceof Error) {
      // Check if it's an environment variable error
      if (error.message.includes("Missing") && error.message.includes("environment variable")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            hint: "Check your .env.local file has all required variables. See .env.local.example for reference.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

