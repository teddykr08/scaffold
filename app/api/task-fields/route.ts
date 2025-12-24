export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/task-fields?app_id=123&task_name=write_email - Fetch all task fields for an app and task
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const app_id = searchParams.get("app_id");
    const task_name = searchParams.get("task_name");

    if (!app_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing app_id query parameter",
        },
        { status: 400 }
      );
    }

    if (!task_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing task_name query parameter",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    const { data, error } = await supabaseServer
      .from("task_fields")
      .select("*")
      .eq("app_id", app_id)
      .eq("task_name", task_name)
      .order("order", { ascending: true });

    if (error) {
      console.error("[Scaffold] Supabase select error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "task_fields",
        operation: "select",
        app_id,
        task_name,
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
      fields: data || [],
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

// POST /api/task-fields - Create a task-specific field
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { app_id, task_name, field_name, field_label, field_type, required, order, options } = body;

    // Validate required fields
    if (!app_id || !task_name || !field_name || !field_label || !field_type) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: app_id, task_name, field_name, field_label, and field_type are required",
        },
        { status: 400 }
      );
    }

    // Validate field_type
    const validFieldTypes = ["text", "textarea", "select", "number", "runtime"];
    if (!validFieldTypes.includes(field_type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid field_type. Must be one of: ${validFieldTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // If field_type is "select", options are required
    if (field_type === "select" && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Field type 'select' requires an 'options' array with at least one option",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    // Prepare the data to insert
    const fieldData: Record<string, unknown> = {
      app_id,
      task_name,
      field_name,
      field_label,
      field_type,
      required: required ?? false,
      order: order ?? 0,
    };

    // Only include options if field_type is select
    if (field_type === "select" && options) {
      fieldData.options = options;
    }

    const { data, error } = await supabaseServer
      .from("task_fields")
      .insert([fieldData])
      .select()
      .single();

    if (error) {
      console.error("[Scaffold] Supabase insert error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        table: "task_fields",
        operation: "insert",
      });

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

    return NextResponse.json({ success: true, field: data });
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

// DELETE /api/task-fields?id=123 - Delete a task field
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing id query parameter",
        },
        { status: 400 }
      );
    }

    const supabaseServer = getSupabaseServer();

    const { error } = await supabaseServer
      .from("task_fields")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Scaffold] Supabase delete error:", {
        message: error.message,
        details: error.details,
        code: error.code,
        table: "task_fields",
        operation: "delete",
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Scaffold] Route error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/task-fields - Update order values for multiple fields
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { updates } = body; // expecting [{ id, order }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing updates array' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    for (const u of updates) {
      if (!u?.id) continue;
      const { error } = await supabase.from('task_fields').update({ order: u.order ?? 0 }).eq('id', u.id);
      if (error) {
        console.error('Error updating task_field order', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

