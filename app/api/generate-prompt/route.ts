export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { app_id, task_name, global_values = {}, task_values = {}, field_values = {}, runtime_context = {}, fixed_content } = body;

    if (!app_id || !task_name) {
      return NextResponse.json(
        { success: false, error: "app_id and task_name are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Fetch task WITH app_id validation
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('app_id', app_id)
      .eq('name', task_name)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { success: false, error: 'Task not found in this app' },
        { status: 404 }
      );
    }

    // Fetch system header
    const { data: app, error: appError } = await supabase
      .from("apps")
      .select("system_header")
      .eq("id", app_id)
      .single();

    if (appError || !app) {
      return NextResponse.json(
        { success: false, error: "App not found" },
        { status: 404 }
      );
    }

    // Fetch template
    const { data: templateRows, error: templateError } = await supabase
      .from("prompt_templates")
      .select("template")
      .eq("app_id", app_id)
      .eq("task_name", task_name)
      .order('created_at', { ascending: false })
      .limit(1);

    if (templateError || !templateRows || templateRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No template found for app_id ${app_id} and task_name "${task_name}". Please save a template in the builder.`,
        },
        { status: 404 }
      );
    }

    const templateRow = templateRows[0];

    // Compose final prompt
    const parts: string[] = [];

    if (task.system_header?.trim()) {
      parts.push(task.system_header.trim());
    } else if (app.system_header?.trim()) {
      parts.push(app.system_header.trim());
    }

    parts.push(templateRow.template);

    let finalPrompt = parts.join('\n\n');

    // ✅ Replace <<fixed>> placeholder if it exists
    if (fixed_content) {
      finalPrompt = finalPrompt.replace(/<<fixed>>/g, fixed_content);
    } else {
      // If no fixed content provided, remove the placeholder
      finalPrompt = finalPrompt.replace(/<<fixed>>/g, '');
    }

    // Combine all values
    const allValues = { ...global_values, ...task_values, ...field_values, ...runtime_context };

    // Replace values
    for (const [key, value] of Object.entries(allValues)) {
      finalPrompt = finalPrompt.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value ? String(value) : ""
      );
    }

    /**
     * CLEANUP STEP (THIS FIXES "at", empty parens, etc)
     */
    // Remove empty lines and excessive whitespace
    const cleanPrompt = (text: string) => {
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n\n'); // Double newline between sections
    };

    /**
     * CLEANUP STEP (THIS FIXES "at", empty parens, etc)
     */
    let prompt = finalPrompt
      // remove leftover {{variables}}
      .replace(/\{\{[^}]+\}\}/g, "")
      // remove empty parentheses
      .replace(/\(\s*\)/g, "")
      // remove " at " if nothing follows
      .replace(/\s+at\s*(\n|$)/g, "$1");

    prompt = cleanPrompt(prompt);

    const chatgptUrl =
      "https://chatgpt.com/?q=" + encodeURIComponent(prompt) + "&embed=true";

    return NextResponse.json({
      success: true,
      prompt,
      chatgpt_url: chatgptUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
