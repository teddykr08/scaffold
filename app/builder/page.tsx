"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

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

function InfoTooltip({
  title,
  purpose,
  whatItDoes,
  example,
  whenToUse,
  important,
}: {
  title: string;
  purpose: string;
  whatItDoes: string;
  example?: string;
  whenToUse: string;
  important?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-2 align-middle">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-blue-600 transition-colors cursor-help"
        aria-label={`Info about ${title}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-xl shadow-xl text-left text-sm top-8 left-0 md:left-auto md:-right-4">
          <div className="font-bold text-gray-900 mb-2">{title}</div>
          <div className="space-y-3 text-gray-600">
            <div>
              <span className="font-semibold text-gray-800">Purpose:</span> {purpose}
            </div>
            <div>
              <span className="font-semibold text-gray-800">What it does:</span>{" "}
              {whatItDoes}
            </div>
            {example && (
              <div className="bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">
                <span className="font-semibold text-gray-500 block mb-1">Example:</span>
                {example}
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-800">When to use:</span>{" "}
              {whenToUse}
            </div>
            {important && (
              <div className="bg-red-50 text-red-800 p-2 rounded border border-red-100 text-xs font-medium">
                ⚠️ {important}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // New: redirect builder to dashboard (replace builder UI)
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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
    const [optionsText, setOptionsText] = useState("");
    const [defaultValue, setDefaultValue] = useState("");

    const showOptions = type === "select";

    return (
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">
            Add Field
          </div>
          <div className="text-xs text-gray-500">order: {nextOrder}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-700">Field label</label>
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
            <label className="text-sm text-gray-700">Field name (variable)</label>
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

          <div className="flex items-center gap-2 mt-6">
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

          {showOptions && (
            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">Options (one per line)</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                rows={4}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={`Professional\nCasual\nFriendly`}
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Default value (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Leave blank for no default"
            />
            <div className="text-xs text-gray-500 mt-1">
              If you do not want defaults in FREE, just leave this blank.
            </div>
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
                options: showOptions
                  ? optionsText
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean)
                  : null,
                default_value: defaultValue.trim() || null,
              })
            }
          >
            Add field
          </button>
        </div>
      </div>
    );
  }

  function RuntimeVariableCreator({
    onAdd,
    nextOrder,
  }: {
    onAdd: (f: Partial<FieldRow>) => Promise<void>;
    nextOrder: number;
  }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-gray-700 font-mono">
            New Runtime Variable
          </div>
          <div className="text-xs text-gray-400">order: {nextOrder}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-700 font-medium">Variable Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
              value={name}
              onChange={(e) => setName(slugifyFieldName(e.target.value))}
              placeholder="e.g. user_id"
            />
            <div className="text-xs text-gray-500 mt-1">
              Used in template as: <span className="font-mono bg-white px-1 rounded border">{`{{${name || "..."}}}`}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">Description (Internal)</label>
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Unique ID for the user"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Runtime variables are NOT shown to users in the embed form.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
            onClick={async () => {
              if (!name.trim()) return;
              await onAdd({
                field_label: description.trim() || name.trim(),
                field_name: name.trim(),
                field_type: "runtime",
                required: false,
                order: nextOrder,
              });
              setName("");
              setDescription("");
            }}
          >
            Add Runtime Variable
          </button>
        </div>
      </div>
    );
  }

  const nextTaskOrder = (taskFields?.reduce((m, f) => Math.max(m, f.order || 0), 0) || 0) + 1;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">Scaffold Builder</h1>
        <p className="text-gray-600 mt-2">
          Build embed forms (fields + template) without touching code.
        </p>

        {status && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm whitespace-pre-line">
            {status}
          </div>
        )}

        {/* App + Task selectors */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-lg flex items-center">
              1) Choose or Create an App
              <InfoTooltip
                title="App Container"
                purpose="Holds all your tasks together."
                whatItDoes="Acts like a folder for your project."
                example="Email Assistant, Recipe Generator"
                whenToUse="Create a new app when you start a completely new project."
              />
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
            <h2 className="font-semibold text-lg flex items-center">
              2) Choose or Create a Task
              <InfoTooltip
                title="Task Management"
                purpose="Manage specific actions your AI performs."
                whatItDoes="Lets you switch between editing existing tasks or creating new ones."
                whenToUse="Use the top box to EDIT. Use the bottom section to CREATE."
              />
            </h2>

            <div className="mt-3">
              <label className="text-sm text-gray-700 flex items-center">
                Active Workspace (Edit Mode)
                <InfoTooltip
                  title="Active Workspace"
                  purpose="Selects which task you are currently editing."
                  whatItDoes="Loads the fields and template for this task so you can modify them."
                  whenToUse="Use this when you want to work on a task you already created."
                />
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
              <div className="text-sm font-medium mb-2 flex items-center">
                Create New Task (Registry)
                <InfoTooltip
                  title="Task Registry"
                  purpose="Registers a new task in the database."
                  whatItDoes="Saves the task name so you can start attaching fields to it."
                  example="write_email, summarize_text"
                  whenToUse="Use this ONLY when setting up a brand new task for the first time."
                />
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
          <h2 className="font-semibold text-lg flex items-center">
            Embed URL
            <InfoTooltip
              title="Embed URL"
              purpose="The link to your generated form."
              whatItDoes="Provides a URL you can put in an iframe on your own website."
              whenToUse="Copy this when you are ready to publish your tool to users."
            />
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
                  Replace "your+context+here" with the dynamic content. Use + for spaces or %20.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fields */}
        <div className="mt-6">
          <FieldCreator kind="task" onAdd={addTaskField} nextOrder={nextTaskOrder} />

          <div className="mt-4 rounded-xl border border-gray-200 p-4">
            <div className="font-semibold mb-2 flex items-center">
              Fields
              <InfoTooltip
                title="Task Fields"
                purpose="Form inputs for this task."
                whatItDoes="Asks the user for info needed for this specific action."
                example="Email Recipient, Tone, Recipe Ingredients"
                whenToUse="Use for inputs that change every time the user runs this task."
              />
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

        {/* Runtime Variables */}
        <div className="mt-8 rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="font-semibold text-lg flex items-center">
            3) Runtime Variables
            <InfoTooltip
              title="Runtime Variables"
              purpose="Context passed by your app, not the user."
              whatItDoes="Allows you to inject data like user_id, organization_name, or session_context directly into the prompt without the user seeing it."
              whenToUse="Use for data your app already knows about the user or the context."
            />
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Provided by your app at request time. These are <strong>not shown</strong> to users in the embed form.
          </p>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RuntimeVariableCreator onAdd={addTaskField} nextOrder={nextTaskOrder} />

            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/30">
              <div className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Active Runtime Variables</div>
              <ul className="space-y-2">
                {taskFields.filter(f => f.field_type === "runtime").map((f) => (
                  <li key={f.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div>
                      <div className="font-mono text-sm font-bold text-blue-700">{`{{${f.field_name}}}`}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.field_label}</div>
                    </div>
                    <button
                      onClick={() => deleteTaskField(f.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove runtime variable"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </li>
                ))}
                {!taskFields.filter(f => f.field_type === "runtime").length && (
                  <div className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 rounded-lg">
                    No runtime variables defined for this task.
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Template */}
        <div className="mt-6 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-lg flex items-center">
            Prompt template
            <InfoTooltip
              title="Prompt Template"
              purpose="The blueprint for the AI."
              whatItDoes="Combines your system header, user inputs (variables), and fixed text into a final message for ChatGPT."
              whenToUse="Edit this to control exactly what the AI sees and how it behaves."
              important={"You MUST click \"Save template\" at least once! If you do not, the embed form will fail with \"No template found\"."}
            />
          </h2>
          <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-4 text-sm">
            <div className="font-semibold text-green-900 mb-2">Example: Prompt Template</div>
            <pre className="font-mono text-xs text-green-800 whitespace-pre-wrap">
{`You are a local search assistant.

Find <<fixed>> near {{location}} within {{radius}} miles.

Provide the top 3 results with:
- Name and address
- Distance from user
- User ratings`}
            </pre>
            <p className="text-xs text-green-700 mt-2">
              ℹ️ <span className="font-mono">{"<<fixed>>"}</span> comes from URL, <span className="font-mono">{"{{location}}"}</span> comes from form fields
            </p>
          </div>
          <div className="mt-2 rounded-lg bg-purple-50 border border-purple-200 p-4 text-sm">
            <div className="font-semibold text-purple-900 mb-2">💡 Special Variable: {"<<fixed>>"}</div>
            <p className="text-purple-800 mb-2">
              Use <span className="font-mono bg-purple-100 px-1">{"<<fixed>>"}</span> in your template for dynamic context that developers pass via URL.
            </p>
            <div className="bg-white rounded p-3 mt-2">
              <div className="text-xs font-semibold text-purple-900 mb-1">Example Use Case:</div>
              <div className="text-xs text-purple-800 space-y-1">
                <div><strong>Template:</strong> <span className="font-mono">Find {"<<fixed>>"} near {{location}}</span></div>
                <div><strong>Embed URL:</strong> <span className="font-mono">/embed/form?...&fixed=birria tacos</span></div>
                <div><strong>Result:</strong> User sees location field only, but prompt says "Find birria tacos near [location]"</div>
              </div>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              ℹ️ The <span className="font-mono">{"<<fixed>>"}</span> value is NOT a form field - it comes from the embed URL parameter.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Template Editor</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                rows={12}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Write your prompt here using {{variable}} syntax..."
              />
            </div>
            <div className="lg:col-span-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Available Variables</label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-4 max-h-[300px] overflow-y-auto">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold mb-1">USER INPUTS</div>
                  <div className="flex flex-wrap gap-1">
                    {taskFields.filter(f => f.field_type !== "runtime").map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTemplate(prev => prev + `{{${f.field_name}}}`)}
                        className="text-[10px] font-mono bg-white border border-gray-300 rounded px-1.5 py-0.5 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        title={f.field_label}
                      >
                        {`{{${f.field_name}}}`}
                      </button>
                    ))}
                    {!taskFields.filter(f => f.field_type !== "runtime").length && <div className="text-[10px] text-gray-400 italic">No fields yet</div>}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-blue-400 font-bold mb-1">RUNTIME VARS</div>
                  <div className="flex flex-wrap gap-1">
                    {taskFields.filter(f => f.field_type === "runtime").map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTemplate(prev => prev + `{{${f.field_name}}}`)}
                        className="text-[10px] font-mono bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5 hover:border-blue-500 hover:bg-blue-100 transition-colors"
                        title={f.field_label}
                      >
                        {`{{${f.field_name}}}`}
                      </button>
                    ))}
                    {!taskFields.filter(f => f.field_type === "runtime").length && <div className="text-[10px] text-gray-400 italic">No runtime vars</div>}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-[10px] text-gray-400 font-bold mb-1">SYSTEM</div>
                  <button
                    onClick={() => setTemplate(prev => prev + `{{system_header}}`)}
                    className="text-[10px] font-mono bg-gray-200 border border-gray-300 rounded px-1.5 py-0.5 hover:border-gray-400 transition-colors"
                  >
                    {"{{system_header}}"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">Click a variable to insert it at the end.</p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mt-6 rounded-xl border border-blue-50 bg-blue-50/30 p-5">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              Live Preview (Mock Data)
            </h3>
            <div className="bg-white rounded-lg border border-blue-100 p-4 font-mono text-xs text-gray-700 whitespace-pre-wrap shadow-inner min-h-[100px]">
              {template.replace(/\{\{(\w+)\}\}/g, (match, p1) => {
                const field = taskFields.find(f => f.field_name === p1);
                if (p1 === "system_header") return "[System Header Instructions]";
                if (field?.field_type === "runtime") return `<runtime:${p1}>`;
                return `[${field?.field_label || p1}]`;
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
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
            <button
              className="rounded-lg border border-blue-300 px-4 py-2 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
              onClick={() => {
                const allFields = taskFields;
                const generated = generateTemplateFromFields(allFields);
                setTemplate(generated);
                setStatus("✅ Template regenerated from fields");
              }}
              title="Replace current text with a fresh version from fields"
            >
              🔄 Regenerate from Fields
            </button>
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => {
                refreshTemplates(selectedAppId, selectedTaskName);
                setStatus("✅ Template reset to last saved version");
              }}
              title="Discard changes and reload last saved template"
            >
              ↩️ Reset to Saved
            </button>
          </div>


        </div>
      </div>
    </main>
  );
}