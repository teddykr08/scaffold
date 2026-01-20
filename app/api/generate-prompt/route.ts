export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabaseServer";
import { ratelimit, getRateLimitKey } from '../../../lib/ratelimit';

// Sanitize template input to prevent prompt injection
const sanitizeTemplateInput = (input: string): string => {
  // Escape double curly braces to prevent template injection
  return input
    .replace(/\{\{/g, '\\{\\{')
    .replace(/\}\}/g, '\\}\\}');
};

export async function POST(req: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const body = await req.json();
    const { app_id, task_name, task_values = {}, field_values = {}, runtime_context = {}, fixed_content } = body;

    if (!app_id || !task_name) {
      return NextResponse.json(
        { success: false, error: "app_id and task_name are required" },
        { status: 400 }
      );
    }

    // Rate limit by IP + app_id
    const identifier = `${ip}:${app_id}`;
    
    const { success: rateLimitSuccess, limit, remaining, reset } = await ratelimit.limit(
      getRateLimitKey(identifier, 'generate-prompt')
    );
    
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again in a few minutes.' 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          }
        }
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
    let finalPrompt = templateRow.template;

    // ✅ Replace <<fixed>> placeholder if it exists
    if (fixed_content) {
      finalPrompt = finalPrompt.replace(/<<fixed>>/g, fixed_content);
    } else {
      // If no fixed content provided, remove the placeholder
      finalPrompt = finalPrompt.replace(/<<fixed>>/g, '');
    }

    // Combine all values
    const allValues = { ...task_values, ...field_values, ...runtime_context };

    // Sanitize all form values before injecting into template
    const sanitizedValues = Object.entries(allValues).reduce((acc, [key, value]) => {
      acc[key] = sanitizeTemplateInput(String(value || ''));
      return acc;
    }, {} as Record<string, string>);

    // Replace values with sanitized versions
    for (const [key, value] of Object.entries(sanitizedValues)) {
      finalPrompt = finalPrompt.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        value
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

    const response = NextResponse.json({
      success: true,
      prompt,
      chatgpt_url: chatgptUrl,
    });
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
