export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/task-fields?app_id=...&task_name=...
export async function GET(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const { searchParams } = new URL(req.url);
        const appId = searchParams.get("app_id");
        const taskName = searchParams.get("task_name");

        if (!appId || !taskName) {
            return NextResponse.json(
                { success: false, error: "Missing app_id or task_name" },
                { status: 400 }
            );
        }

        // Public endpoint for embed forms - no auth required for GET
        const { data, error } = await supabaseServer
            .from("task_fields")
            .select("*")
            .eq("app_id", appId)
            .eq("task_name", taskName)
            .order("order", { ascending: true });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            fields: (data || []).filter((f: any) =>
                !f.field_label?.toLowerCase().includes("additional") &&
                !f.field_name?.toLowerCase().includes("additional")
            ),
        });
    } catch (error) {
        console.error("[task-fields] GET error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/task-fields - Create a new task field
export async function POST(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const body = await req.json();
        const { app_id, task_name, field_name, field_label, field_type, required, order, options, default_value } = body;

        if (!app_id || !task_name || !field_name || !field_label) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data, error } = await supabaseServer
            .from("task_fields")
            .insert([{
                app_id,
                task_name,
                field_name,
                field_label,
                field_type: field_type || "text",
                required: required !== false,
                order: order || 1,
                options: options || null,
                default_value: default_value || null,
                user_id: user.id
            }])
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, field: data });
    } catch (error) {
        console.error("[task-fields] POST error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/task-fields?id=...
export async function DELETE(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id" },
                { status: 400 }
            );
        }

        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { error } = await supabaseServer
            .from("task_fields")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[task-fields] DELETE error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
