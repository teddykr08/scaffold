"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type AppRow = {
  id: string;
  name: string;
  system_header: string;
  created_at: string;
};

type TaskRow = {
  id: string;
  name: string;
  description: string | null;
  system_header?: string | null;
  fixed_content?: string | null;
  created_at: string;
};

type FieldType = "text" | "textarea" | "select" | "number" | "runtime";

type FieldRow = {
  id: string;
  app_id: string;
  task_name?: string;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  required: boolean;
  order: number;
  options?: string[] | null;
  default_value?: string | null;
  created_at: string;
};

type TemplateRow = {
  id: string;
  app_id: string;
  task_name: string;
  template: string;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
};

function slugifyFieldName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ ]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 48);
}

function safeJson(res: Response) {
  return res.text().then((t) => {
    try {
      return JSON.parse(t);
    } catch {
      return { success: false, error: t || `HTTP ${res.status}` };
    }
  });
}

async function authenticatedFetch(
  url: string,
  options: RequestInit & { isPublic?: boolean } = {}
) {
  const { isPublic = false, ...fetchOptions } = options;

  if (!isPublic) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  }

  return fetch(url, fetchOptions);
}

// ✅ Quality Guardrail Function
function validateTemplate(template: string, fields: FieldRow[]): string | null {
  const templateVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
  const fieldNames = fields.map(f => f.field_name);
  const missing = templateVars.filter(v => !fieldNames.includes(v) && v !== "system_header");

  if (missing.length > 0) {
    return `⚠️ Template uses undefined variables: ${missing.join(", ")}. Add these as fields or remove them from the template.`;
  }

  return null;
}

// Auto-generate template from fields
function generateTemplateFromFields(fields: FieldRow[]): string {
  const header = "You are a [define here]";
  const formFields = fields.filter(f => f.field_type !== "runtime");

  if (formFields.length === 0) {
    return header;
  }

  const fieldLines = formFields
    .sort((a, b) => a.order - b.order)
    .map(f => `${f.field_label}: {{${f.field_name}}}`)
    .join("\n");

  return `${header}\n\n${fieldLines}`;
}

export default function TaskEditorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appId = params?.app_id as string;
  const taskName = params?.task_name as string;

  const [app, setApp] = useState<AppRow | null>(null);
  const [task, setTask] = useState<TaskRow | null>(null);
  const [taskFields, setTaskFields] = useState<FieldRow[]>([]);
  const [status, setStatus] = useState<string>("");
  const [template, setTemplate] = useState<string>("You are a [define here]");
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [lastSavedTemplate, setLastSavedTemplate] = useState<string>("");

  const embedUrl = useMemo(() => {
    if (!appId || !taskName) return "";
    return `/embed/form?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`;
  }, [appId, taskName]);

  const prodEmbedUrlHint = useMemo(() => {
    return embedUrl ? `https://scaffoldtool.vercel.app${embedUrl}` : "";
  }, [embedUrl]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!appId || !taskName) return;
    refreshApp();
    refreshTask();
    refreshTaskFields();
    refreshTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, taskName]);

  async function refreshApp() {
    const res = await authenticatedFetch("/api/apps", { method: "GET" });
    const data = await safeJson(res);
    if (data?.success) {
      const foundApp = (data.apps || []).find((a: AppRow) => a.id === appId);
      setApp(foundApp || null);
    }
  }

  async function refreshTask() {
    if (!appId) return;
    const res = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(appId)}`);
    const data = await safeJson(res);
    if (data?.success) {
      const foundTask = (data.tasks || []).find((t: TaskRow) => t.name === taskName);
      setTask(foundTask || null);
    }
  }

  async function refreshTaskFields() {
    if (!appId || !taskName) return;
    const res = await authenticatedFetch(
      `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`
    );
    const data = await safeJson(res);
    if (data?.success) setTaskFields(data.fields || []);
  }

  async function refreshTemplates() {
    if (!appId || !taskName) return;
    const res = await authenticatedFetch(
      `/api/prompt-templates?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`
    );
    const data = await safeJson(res);
    if (data?.success) {
      const rows: TemplateRow[] = data.templates || [];
      setTemplates(rows);
      if (rows.length && rows[0]?.template) {
        setTemplate(rows[0].template);
        setLastSavedTemplate(rows[0].template);
      } else {
        setTemplate("You are a [define here]");
        setLastSavedTemplate("");
      }
    }
  }

  async function addTaskField(f: Partial<FieldRow>) {
    if (!appId || !taskName) return;
    setStatus("");
    const res = await authenticatedFetch("/api/task-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, task_name: taskName, ...f }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Add task field failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ Task field added");
    await refreshTaskFields();
  }

  async function deleteTaskField(fieldId: string) {
    if (!appId || !taskName) return;
    if (!confirm("Are you sure you want to delete this task field?")) return;

    setStatus("");
    const res = await authenticatedFetch(`/api/task-fields?id=${fieldId}`, {
      method: "DELETE",
    });
    const data = await safeJson(res);

    if (!data?.success) {
      setStatus(`❌ Delete task field failed: ${data?.error || "unknown error"}`);
      return;
    }

    setStatus("✅ Task field deleted");
    await refreshTaskFields();
  }

  async function saveTemplate() {
    if (!appId || !taskName) {
      setStatus("❌ Select app + task first");
      return;
    }

    const allFields = taskFields;
    const warning = validateTemplate(template, allFields);

    if (warning) {
      setStatus(warning);
    }

    const res = await authenticatedFetch("/api/prompt-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: appId,
        task_name: taskName,
        template,
      }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Save template failed: ${data?.error || "unknown error"}`);
      return;
    }

    if (warning) {
      setStatus(`${warning}\n\n✅ Template saved anyway (fix the warnings above)`);
    } else {
      setStatus("✅ Template saved");
      setLastSavedTemplate(template);
      await refreshTemplates();
    }
  }

  function FieldCreator({
    kind,
    onAdd,
    nextOrder,
  }: {
    kind: "global" | "task";
    onAdd: (f: Partial<FieldRow>) => Promise<void>;
    nextOrder: number;
  }) {
    const [label, setLabel] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState<FieldType>("text");
    const [required, setRequired] = useState(true);

    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">
            Add Field
          </div>
          <div className="text-xs text-gray-500">order: {nextOrder}</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-700">Label</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!name) setName(slugifyFieldName(e.target.value));
              }}
              placeholder="e.g. Your Name"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Field Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              value={name}
              onChange={(e) => setName(slugifyFieldName(e.target.value))}
              placeholder="e.g. user_name"
            />
            <div className="text-xs text-gray-500 mt-1">
              Template variable: <span className="font-mono">{`{{${name || "field_name"}}}`}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Type</label>
            <select
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
            >
              <option value="text">text</option>
              <option value="textarea">textarea</option>
              <option value="number">number</option>
              <option value="select">select</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id={`${kind}-required`}
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <label htmlFor={`${kind}-required`} className="text-sm text-gray-800">
              Required
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
            onClick={() =>
              onAdd({
                field_label: label.trim(),
                field_name: slugifyFieldName(name || label),
                field_type: type,
                required,
                order: nextOrder,
                options: null,
                default_value: null,
              })
            }
          >
            Add field
          </button>
        </div>
      </div>
    );
  }

  const nextTaskOrder = (taskFields?.reduce((m, f) => Math.max(m, f.order || 0), 0) || 0) + 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href={`/dashboard/${appId}`}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
            >
              ← Back to {app?.name}
            </Link>
            <h1 className="text-3xl font-bold">{taskName}</h1>
            <p className="text-gray-600 mt-1">Edit task settings, fields, and prompt template</p>
          </div>
          <button 
            onClick={async () => {
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL || "",
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
              );
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>

        {status && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm whitespace-pre-line">
            {status}
          </div>
        )}

        {/* Embed URL Section */}
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-lg">
            Embed URL
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Developers iframe this into their app.
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3 font-mono text-sm break-all">
            {embedUrl || "Select an app + task to generate an embed URL"}
          </div>

          {prodEmbedUrlHint && (
            <>
              <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                Base URL: {prodEmbedUrlHint}
              </div>
              <div className="mt-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs">
                <div className="font-semibold text-blue-900 mb-1">💡 Adding Dynamic Context:</div>
                <div className="text-blue-800 font-mono break-all">
                  {prodEmbedUrlHint}&fixed=your+context+here
                </div>
                <div className="text-blue-700 mt-2">
                  Replace <span className="font-mono">your+context+here</span> with the dynamic content. Use + for spaces or %20.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fields */}
        <div className="mt-6">
          <FieldCreator kind="task" onAdd={addTaskField} nextOrder={nextTaskOrder} />

          <div className="mt-4 rounded-xl border border-gray-200 p-4">
            <div className="font-semibold mb-2">
              Form Fields
            </div>
            <div className="text-sm text-gray-600 mb-3">
              These show in the form for task: <span className="font-mono">{taskName}</span>
            </div>

            <ul className="space-y-2 text-sm">
              {taskFields.filter(f => f.field_type !== "runtime").map((f) => (
                <li key={f.id} className="relative rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{f.field_label}</div>
                    <div className="text-xs text-gray-500">
                      {f.required ? "required" : "optional"} · {f.field_type} · order {f.order}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 font-mono">{`{{${f.field_name}}}`}</div>
                  <button
                    onClick={() => deleteTaskField(f.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                    title="Delete field"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </li>
              ))}
              {!taskFields.filter(f => f.field_type !== "runtime").length && <li className="text-gray-500">No fields yet.</li>}
            </ul>
          </div>
        </div>

        {/* Template */}
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-lg">
            Prompt Template
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Use <span className="font-mono">{"{{field_name}}"}</span> for form fields. Use <span className="font-mono">{"<<fixed>>"}</span> for URL parameters (example: &fixed=recipe+name).
          </p>

          <div className="mt-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Template</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              rows={10}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your prompt here using {{variable}} syntax..."
            />
          </div>

          <div className="mt-4">
            <button
              className={`rounded-lg px-4 py-2 text-white transition-colors ${template === lastSavedTemplate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
                }`}
              onClick={saveTemplate}
              disabled={template === lastSavedTemplate}
            >
              {template === lastSavedTemplate ? "✓ Saved" : "Save template"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
