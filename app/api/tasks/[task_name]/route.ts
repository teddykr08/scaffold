export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("app_id");
    const path = req.nextUrl.pathname;
    const parts = path.split('/');
    const taskName = parts[parts.length - 1];

    if (!appId) {
      return NextResponse.json({ success: false, error: 'Missing app_id' }, { status: 400 });
    }

    if (!taskName) {
      return NextResponse.json({ success: false, error: 'Missing task_name' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('app_id', appId)
      .eq('name', taskName)
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
