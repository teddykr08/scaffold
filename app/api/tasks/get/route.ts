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

        // Use RPC with raw SQL to bypass Supabase query caching
        const { data, error } = await supabase.rpc('get_fresh_task', {
            p_app_id: app_id,
            p_name: name
        });

        const task = data?.[0];

        console.log('[tasks/get]', { app_id, name, error, data: task });

        if (error || !task) {
            return NextResponse.json(
                { success: false, error: error?.message || "Task not found" },
                { status: 404 }
            );
        }

        const response = NextResponse.json({
            success: true,
            task,
        });

        // Prevent any caching of customization data
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');

        return response;
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
