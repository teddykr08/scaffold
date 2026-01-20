
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseServer();

        // 1. Delete the logical field 'Additional Instructions' for the current user
        // We use 'ilike' to match variations and also target the field_name
        const { error } = await supabase
            .from('task_fields')
            .delete()
            .or('field_label.ilike.%Additional%,field_name.ilike.%additional%');

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Cleaned up legacy fields." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
