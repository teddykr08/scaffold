export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";

// GET /api/apps/[id] - Get one specific app by ID (only if user owns it)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing app ID" },
        { status: 400 }
      );
    }

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
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("[Scaffold] Supabase select error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "apps",
        operation: "select",
        id,
      });

      // Handle "not found" case
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "App not found",
          },
          { status: 404 }
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

    return NextResponse.json({
      success: true,
      app: data,
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

// PUT /api/apps/[id] - Update app name
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing app ID" },
        { status: 400 }
      );
    }

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

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("apps")
      .update({ name: name.trim() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[Scaffold] Supabase update error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "apps",
        operation: "update",
        id,
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
      app: data,
    });
  } catch (error) {
    console.error("[Scaffold] Route error:", error);

    if (error instanceof Error) {
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
