export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/tasks - Get all tasks
export async function GET(req: NextRequest) {
  try {
    const supabaseServer = getSupabaseServer();

    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('app_id');

    let query = supabaseServer.from('tasks').select('*');

    // Filter by app if provided
    if (appId) {
      query = query.eq('app_id', appId);
    }

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

    const { app_id, name, description, system_header } = body;

    if (!app_id || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'app_id and task name required' },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    const { data, error } = await supabaseServer
      .from("tasks")
      .insert({
        app_id,
        name: name.trim(),
        description: description || null,
        system_header: system_header || null,
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
            error: "A task with this name already exists",
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

// PATCH /api/tasks - Update task attributes (e.g., has_form)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { app_id, name, has_form } = body;

    if (!app_id || !name) {
      return NextResponse.json({ success: false, error: 'app_id and name required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from('tasks').update({ has_form }).eq('app_id', app_id).eq('name', name).select().single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}



