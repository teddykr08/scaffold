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
                min: body.min !== undefined ? body.min : null,
                max: body.max !== undefined ? body.max : null,
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

// PUT /api/task-fields - Update an existing task field
export async function PUT(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const body = await req.json();
        const { id, field_label, field_type, required, options, min, max, order } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing field id" },
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

        const updates: any = {};
        if (field_label !== undefined) updates.field_label = field_label;
        if (field_type !== undefined) updates.field_type = field_type;
        if (required !== undefined) updates.required = required;
        if (options !== undefined) updates.options = options;
        if (min !== undefined) updates.min = min;
        if (max !== undefined) updates.max = max;
        if (order !== undefined) updates.order = order;

        // First, get the field to check app ownership
        const { data: existingField, error: fetchError } = await supabaseServer
            .from("task_fields")
            .select("app_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingField) {
            console.error("[task-fields] PUT: Field not found", { id, error: fetchError });
            return NextResponse.json(
                { success: false, error: "Field not found" },
                { status: 404 }
            );
        }

        // Check if the app exists and belongs to the user
        const { data: app, error: appError } = await supabaseServer
            .from("apps")
            .select("user_id")
            .eq("id", existingField.app_id)
            .single();

        if (appError || !app) {
            console.warn("[task-fields] PUT: App not found for field", { 
                fieldId: id, 
                appId: existingField.app_id,
                error: appError 
            });
            // App doesn't exist but field does (orphaned field)
            // Allow the update but log the issue
            console.log("[task-fields] PUT: Allowing update for orphaned field");
        } else if (app.user_id !== user.id) {
            console.error("[task-fields] PUT: Unauthorized - app belongs to different user", { 
                appUserId: app.user_id, 
                requestUserId: user.id 
            });
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Update the field
        const { data, error } = await supabaseServer
            .from("task_fields")
            .update(updates)
            .eq("id", id)
            .select();

        if (error) {
            console.error("[task-fields] PUT Supabase error:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            console.error("[task-fields] PUT: No rows updated", { id });
            return NextResponse.json(
                { success: false, error: "Field not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, field: data[0] });
    } catch (error) {
        console.error("[task-fields] PUT error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
