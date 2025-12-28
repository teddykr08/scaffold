"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
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

// ✅ Quality Guardrail Function
function validateTemplate(template: string, fields: FieldRow[]): string | null {
  // Extract all {{variable}} from template
  const templateVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
  
  // Get all field names
  const fieldNames = fields.map(f => f.field_name);
  
  // Find variables that don't have corresponding fields
  // Note: <<fixed>> uses different brackets, so it won't be caught here
  const missing = templateVars.filter(v => !fieldNames.includes(v) && v !== "system_header");

  if (missing.length > 0) {
    return `⚠️ Template uses undefined variables: ${missing.join(", ")}. Add these as fields or remove them from the template.`;
  }

  return null;
}

// Auto-generate template from fields
function generateTemplateFromFields(fields: FieldRow[]): string {
  const header = "You are a [define here]";

  // Exclude runtime variables from auto-generation as they are handled dynamically
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



export default function BuilderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // --- All Hooks MUST be at top level before any returns ---
  // --- App ---
  const [apps, setApps] = useState<AppRow[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [newAppName, setNewAppName] = useState("");

  // --- Task ---
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [selectedTaskName, setSelectedTaskName] = useState<string>("write_email");
  const [newTaskName, setNewTaskName] = useState("");
  const [lastSavedTemplate, setLastSavedTemplate] = useState<string>("");

  // --- Fields ---
  const [taskFields, setTaskFields] = useState<FieldRow[]>([]);
  const [status, setStatus] = useState<string>("");

  // --- Template ---
  const [template, setTemplate] = useState<string>(
    "You are a [define here]"
  );
  const [templates, setTemplates] = useState<TemplateRow[]>([]);

  const embedUrl = useMemo(() => {
    if (!selectedAppId || !selectedTaskName) return "";
    return `/embed/form?app_id=${encodeURIComponent(selectedAppId)}&task_name=${encodeURIComponent(selectedTaskName)}`;
  }, [selectedAppId, selectedTaskName]);

  const prodEmbedUrlHint = useMemo(() => {
    return embedUrl ? `https://scaffoldtool.vercel.app${embedUrl}` : "";
  }, [embedUrl]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    refreshApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAppId) return;
    setTasks([]);
    setTemplates([]);
    refreshTasks();
    refreshTemplates(selectedAppId, selectedTaskName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppId]);

  useEffect(() => {
    if (!selectedAppId || !selectedTaskName) return;
    setTaskFields([]);
    refreshTaskFields(selectedAppId, selectedTaskName);
    refreshTemplates(selectedAppId, selectedTaskName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskName, selectedAppId]);

  // Now we can do conditional returns
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

  async function refreshApps() {
    const res = await fetch("/api/apps", { method: "GET" });
    const data = await safeJson(res);
    if (data?.success) {
      setApps(data.apps || []);
      if (!selectedAppId && (data.apps || []).length) {
        setSelectedAppId(data.apps[0].id);
      }
    }
  }

  async function refreshTasks() {
    if (!selectedAppId) return;
    const res = await fetch(`/api/tasks?app_id=${encodeURIComponent(selectedAppId)}`);
    const data = await safeJson(res);
    if (data?.success) setTasks(data.tasks || []);
  }

  async function refreshTaskFields(appId: string, taskName: string) {
    if (!appId || !taskName) return;
    const res = await fetch(
      `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`
    );
    const data = await safeJson(res);
    if (data?.success) setTaskFields(data.fields || []);
  }

  async function refreshTemplates(appId: string, taskName: string, options?: { skipSetTemplate?: boolean }) {
    if (!appId) return;
    const url =
      taskName
        ? `/api/prompt-templates?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`
        : `/api/prompt-templates?app_id=${encodeURIComponent(appId)}`;
    const res = await fetch(url);
    const data = await safeJson(res);
    if (data?.success) {
      const rows: TemplateRow[] = data.templates || [];
      setTemplates(rows);

      if (!options?.skipSetTemplate) {
        if (rows.length && rows[0]?.template) {
          setTemplate(rows[0].template);
          setLastSavedTemplate(rows[0].template);
        } else {
          setTemplate("You are a [define here]");
          setLastSavedTemplate("");
        }
      }
    }
  }

  async function createApp() {
    setStatus("");
    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAppName }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Create app failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ App created");

    setNewAppName("");
    await refreshApps();
    if (data.app?.id) setSelectedAppId(data.app.id);
  }

  async function createTask() {
    setStatus("");

    if (!selectedAppId) {
      setStatus("❌ Select an app first");
      return;
    }

    const name = newTaskName.trim();
    if (!name) {
      setStatus("❌ Task name required");
      return;
    }
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: selectedAppId,
        name,
      }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Create task failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ Task created");
    setNewTaskName("");
    await refreshTasks();
    setSelectedTaskName(name);
  }

  async function addTaskField(f: Partial<FieldRow>) {
    if (!selectedAppId || !selectedTaskName) return;
    setStatus("");
    const res = await fetch("/api/task-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: selectedAppId, task_name: selectedTaskName, ...f }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Add task field failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ Task field added");
    await refreshTaskFields(selectedAppId, selectedTaskName);
  }

  async function deleteTaskField(fieldId: string) {
    if (!selectedAppId || !selectedTaskName) return;
    if (!confirm("Are you sure you want to delete this task field?")) return;

    setStatus("");
    const res = await fetch(`/api/task-fields?id=${fieldId}`, {
      method: "DELETE",
    });
    const data = await safeJson(res);

    if (!data?.success) {
      setStatus(`❌ Delete task field failed: ${data?.error || "unknown error"}`);
      return;
    }

    setStatus("✅ Task field deleted");
    await refreshTaskFields(selectedAppId, selectedTaskName);
  }

  async function saveTemplate() {
    if (!selectedAppId || !selectedTaskName) {
      setStatus("❌ Select app + task first");
      return;
    }

    const allFields = taskFields;
    const warning = validateTemplate(template, allFields);

    if (warning) {
      setStatus(warning);
    }

    setStatus("");
    const res = await fetch("/api/prompt-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: selectedAppId,
        task_name: selectedTaskName,
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
      await refreshTemplates(selectedAppId, selectedTaskName, { skipSetTemplate: true });
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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Manage your apps and forms</p>
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

        {/* App + Task selectors */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-lg">
              Your Apps
            </h2>

            <div className="mt-3">
              <label className="text-sm text-gray-700">Existing apps</label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
              >
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.id.slice(0, 6)}...)
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="text-sm font-medium mb-2">Create new app</div>

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="App name (e.g. Email Assistant)"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
              />
              <button
                className="mt-3 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                onClick={createApp}
              >
                Create App
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-lg">
              Tasks
            </h2>

            <div className="mt-3">
              <label className="text-sm text-gray-700">
                Edit Task
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                value={selectedTaskName}
                onChange={(e) => setSelectedTaskName(slugifyFieldName(e.target.value))}
                placeholder="write_email"
              />
              <div className="text-xs text-gray-500 mt-1">
                This becomes the task_name used everywhere.
              </div>

              {tasks.length > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  Existing tasks:{" "}
                  {tasks.slice(0, 6).map((t, i) => (
                    <span key={t.id}>
                      {i ? ", " : ""}
                      <span className="font-mono">{t.name}</span>
                    </span>
                  ))}
                  {tasks.length > 6 ? "…" : ""}
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="text-sm font-medium mb-2">
                Create New Task
              </div>

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                placeholder="Task name (e.g. write_email)"
                value={newTaskName}
                onChange={(e) => setNewTaskName(slugifyFieldName(e.target.value))}
              />

              <button
                className="mt-3 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                onClick={createTask}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Embed URL */}
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
              These show in the form for task: <span className="font-mono">{selectedTaskName}</span>
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