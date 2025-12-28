export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const app_id = searchParams.get("app_id");
        const name = searchParams.get("name");

        if (!app_id || !name) {
            return NextResponse.json(
                { success: false, error: "Missing app_id or name" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Since embed might be public, this search should be careful. 
        // However, the user diagram implies everything is tied to user_id.
        // For now, we fetch the task. (Note: In a true public embed, you'd want a separate check).
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("app_id", app_id)
            .eq("name", name)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { success: false, error: "Task not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            task: data,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
