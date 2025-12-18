# Diff for GET Handler Addition/Update

## Current State
The file currently has a GET handler (lines 4-46) but it's missing:
- Sorting by `updated_at DESC`
- Proper error handling similar to POST handler
- Better comments

## Proposed Changes

Adding/enhancing the GET handler to include sorting and improved error handling.

```diff
 import { NextRequest, NextResponse } from "next/server";
 import { getSupabaseServer } from "@/lib/supabaseServer";
 
+// GET /api/prompt-templates - Get prompt templates by app_id and optional task_name
+export async function GET(req: NextRequest) {
+  try {
+    const app_id = req.nextUrl.searchParams.get("app_id");
+    const task_name = req.nextUrl.searchParams.get("task_name");
+
+    if (!app_id) {
+      return NextResponse.json(
+        {
+          success: false,
+          error: "Missing query param: app_id",
+        },
+        { status: 400 }
+      );
+    }
+
+    const supabaseServer = getSupabaseServer();
+
+    // Build query: filter by app_id, optionally by task_name
+    let query = supabaseServer
+      .from("prompt_templates")
+      .select("*")
+      .eq("app_id", app_id)
+      .order("updated_at", { ascending: false });
+
+    if (task_name) {
+      query = query.eq("task_name", task_name);
+    }
+
+    const { data, error } = await query;
+
+    if (error) {
+      console.error("[Scaffold] Supabase select error:", {
+        message: error.message,
+        details: error.details,
+        code: error.code,
+        table: "prompt_templates",
+        operation: "select",
+      });
+
+      if (error.code === "42501" || error.message?.includes("permission denied")) {
+        return NextResponse.json(
+          {
+            success: false,
+            error: "RLS policy error - service role key may not be configured correctly",
+            details: error.message,
+            hint: "Verify SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local",
+          },
+          { status: 500 }
+        );
+      }
+
+      return NextResponse.json(
+        {
+          success: false,
+          error: error.message,
+          code: error.code,
+          details: error.details,
+        },
+        { status: 500 }
+      );
+    }
+
+    // Return success with templates array (empty if not found, not an error)
+    return NextResponse.json({
+      success: true,
+      templates: data || [],
+    });
+  } catch (error) {
+    console.error("[Scaffold] Route error:", error);
+
+    if (error instanceof Error) {
+      if (error.message.includes("Missing") && error.message.includes("environment variable")) {
+        return NextResponse.json(
+          {
+            success: false,
+            error: error.message,
+            hint: "Check your .env.local file has all required variables. See .env.local.example for reference.",
+          },
+          { status: 500 }
+        );
+      }
+
+      return NextResponse.json(
+        {
+          success: false,
+          error: error.message,
+        },
+        { status: 500 }
+      );
+    }
+
+    return NextResponse.json(
+      { success: false, error: "Internal server error" },
+      { status: 500 }
+    );
+  }
+}
+
 // POST /api/prompt-templates - Create a prompt template with variables
 export async function POST(req: NextRequest) {
   ...
```

## Key Changes:
1. ✅ Accepts `app_id` (required) and `task_name` (optional) via query params
2. ✅ If both provided → returns templates filtered by both (will be 0 or 1 item in array)
3. ✅ If only `app_id` → returns all templates for that app
4. ✅ Returns JSON `{ success: true, templates: [...] }`
5. ✅ If not found, returns `{ success: true, templates: [] }` (not an error)
6. ✅ Sorts results by `updated_at DESC`
7. ✅ Added comprehensive error handling similar to POST handler
8. ✅ Wrapped in try-catch for better error handling


