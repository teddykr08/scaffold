export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/prompt-templates - Get prompt templates for an app
export async function GET(req: NextRequest) {
  try {
    const app_id = req.nextUrl.searchParams.get("app_id");
    const task_name = req.nextUrl.searchParams.get("task_name");

    if (!app_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing query param: app_id",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    // Fetch templates
    let query = supabaseServer
      .from("prompt_templates")
      .select("*")
      .eq("app_id", app_id);

    if (task_name) {
      query = query.eq("task_name", task_name);
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[Scaffold] Supabase select error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "prompt_templates",
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
      templates: data || [],
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

// POST /api/prompt-templates - Create a prompt template with variables
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { app_id, task_name, template } = body;

    // Validate required fields
    if (!app_id || !task_name || !template) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: app_id, task_name, and template are required",
        },
        { status: 400 }
      );
    }

    // Validate that template is a non-empty string
    if (typeof template !== "string" || template.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Template must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    const { data, error } = await supabaseServer
      .from("prompt_templates")
      .insert([{ app_id, task_name, template }])
      .select()
      .single();

    if (error) {
      console.error("[Scaffold] Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        table: "prompt_templates",
        operation: "insert",
      });

      // Check for duplicate template error (if you have a unique constraint)
      if (error.code === "23505" || error.message?.includes("duplicate key")) {
        return NextResponse.json(
          {
            success: false,
            error: "A template already exists for this app and task combination",
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

    return NextResponse.json({ success: true, template: data });
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

// PATCH /api/prompt-templates - Update a prompt template
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const { app_id, task_name, template, new_task_name, id } = body;

    // Validate required fields - need app_id and either task_name or id to identify the row
    if (!app_id || (!task_name && !id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: app_id and (task_name or id) are required",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    // Build update object
    const updateData: Record<string, any> = {};
    if (template !== undefined) {
      if (typeof template !== "string" || template.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Template must be a non-empty string",
          },
          { status: 400 }
        );
      }
      updateData.template = template;
    }
    if (new_task_name !== undefined) {
      if (typeof new_task_name !== "string" || new_task_name.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "new_task_name must be a non-empty string",
          },
          { status: 400 }
        );
      }
      updateData.task_name = new_task_name;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No fields to update. Provide template or new_task_name",
        },
        { status: 400 }
      );
    }

    // Build query - use id if provided, otherwise use app_id + task_name
    let query = supabaseServer
      .from("prompt_templates")
      .update(updateData)
      .eq("app_id", app_id);

    if (id) {
      query = query.eq("id", id);
    } else {
      query = query.eq("task_name", task_name);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error("[Scaffold] Supabase update error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        table: "prompt_templates",
        operation: "update",
      });

      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: `No template found for app_id ${app_id} and task_name "${task_name}"`,
          },
          { status: 404 }
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

    return NextResponse.json({ success: true, template: data });
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

