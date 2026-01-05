export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

// GET /api/prompt-templates?app_id=...&task_name=...
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
            .from("prompt_templates")
            .select("*")
            .eq("app_id", appId)
            .eq("task_name", taskName)
            .eq("user_id", user.id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            templates: data || [],
        });
    } catch (error) {
        console.error("[prompt-templates] GET error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/prompt-templates - Create or UPDATE template
export async function POST(req: NextRequest) {
    try {
        const supabaseServer = getSupabaseServer();
        const body = await req.json();
        const { app_id, task_name, template } = body;

        if (!app_id || !task_name || !template) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate template and generate warnings
        const warnings = [];
        
        if (!template.includes('{{')) {
            warnings.push('Template has no variables - AI won\'t use any form inputs');
        }
        
        // Check for potentially harmful patterns
        const harmfulPatterns = ['ignore previous', 'disregard', 'system:', 'assistant:'];
        const hasHarmful = harmfulPatterns.some(pattern => 
            template.toLowerCase().includes(pattern)
        );
        
        if (hasHarmful) {
            warnings.push('Template contains patterns that might cause unexpected AI behavior');
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

        // Check if template already exists
        const { data: existing } = await supabaseServer
            .from("prompt_templates")
            .select("id")
            .eq("app_id", app_id)
            .eq("task_name", task_name)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            // UPDATE existing template
            const { data, error } = await supabaseServer
                .from("prompt_templates")
                .update({ template, updated_at: new Date().toISOString() })
                .eq("id", existing.id)
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, template: data, warnings });
        } else {
            // INSERT new template
            const { data, error } = await supabaseServer
                .from("prompt_templates")
                .insert([{ app_id, task_name, template, user_id: user.id }])
                .select()
                .single();

            if (error) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true, template: data, warnings });
        }
    } catch (error) {
        console.error("[prompt-templates] POST error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/prompt-templates?id=...
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
            .from("prompt_templates")
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
        console.error("[prompt-templates] DELETE error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
