export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/tasks?app_id=...
export async function GET(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const { searchParams } = new URL(req.url);
        const appId = searchParams.get("app_id");

        if (!appId) {
            return NextResponse.json(
                { success: false, error: "Missing app_id" },
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
            .from("tasks")
            .select("*")
            .eq("app_id", appId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            tasks: data || [],
        });
    } catch (error) {
        console.error("[tasks] GET error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const body = await req.json();
        const { app_id, name, description, has_form } = body;

        if (!app_id || !name) {
            return NextResponse.json(
                { success: false, error: "Missing app_id or name" },
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
            .from("tasks")
            .insert([{
                app_id,
                name,
                description: description || null,
                has_form: has_form !== false,
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

        return NextResponse.json({ success: true, task: data });
    } catch (error) {
        console.error("[tasks] POST error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks?id=...
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

        // Delete the task (CASCADE will handle related records)
        const { error } = await supabaseServer
            .from("tasks")
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
        console.error("[tasks] DELETE error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/tasks - Update a task
export async function PUT(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const body = await req.json();
        const { id, theme, custom_color, font, name } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing task id" },
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

        // Update the task
        const updates: Record<string, any> = {};
        if (theme !== undefined) updates.theme = theme;
        if (custom_color !== undefined) updates.custom_color = custom_color;
        if (font !== undefined) updates.font = font;
        if (name !== undefined && name.trim()) updates.name = name.trim();

        console.log("[tasks] PUT -> updating task", { id, user_id: user.id, updates });

        const { data, error } = await supabaseServer
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();

        console.log("[tasks] PUT -> response", { error, data });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, task: data });
    } catch (error) {
        console.error("[tasks] PUT error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
