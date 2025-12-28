export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/tasks - Get all tasks for user's app
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

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('app_id');

    let query = supabaseServer.from('tasks').select('*');

    // Filter by app if provided
    if (appId) {
      query = query.eq('app_id', appId);
    }

    // Always filter by user_id for security
    query = query.eq('user_id', user.id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("[Scaffold] Supabase select error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "tasks",
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
      tasks: data || [],
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

// POST /api/tasks - Create a task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { app_id, name } = body;

    if (!app_id || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'app_id and task name required' },
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

    // Verify the app belongs to the user
    const { data: appData, error: appError } = await supabaseServer
      .from("apps")
      .select("id")
      .eq("id", app_id)
      .eq("user_id", user.id)
      .single();

    if (appError || !appData) {
      return NextResponse.json(
        { success: false, error: "App not found or you do not have access" },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseServer
      .from("tasks")
      .insert({
        app_id,
        name: name.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[Scaffold] Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        table: "tasks",
        operation: "insert",
      });

      // Check for duplicate task name error (unique constraint)
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        return NextResponse.json(
          {
            success: false,
            error: "A task with this name already exists in this app",
            details: error.message,
          },
          { status: 409 }
        );
      }

      if (error.code === "42501" || error.message?.includes("permission denied")) {
        return NextResponse.json(
          {
            success: false,
            error: "RLS policy error - service role key may not be configured correctly",
            details: error.message,
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

    return NextResponse.json({ success: true, task: data });
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



