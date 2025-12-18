"use client";

import { useEffect, useMemo, useState } from "react";

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
  created_at: string;
};

type FieldType = "text" | "textarea" | "select" | "number";

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

// ✅ NEW: Quality Guardrail Function
function validateTemplate(template: string, fields: FieldRow[]): string | null {
  // Extract all {{variable}} from template
  const templateVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);

  // Get all field names
  const fieldNames = fields.map(f => f.field_name);

  // Find variables that do not have corresponding fields
  const missing = templateVars.filter(v => !fieldNames.includes(v) && v !== "system_header");

  if (missing.length > 0) {
    return `⚠️ Template uses undefined variables: ${missing.join(", ")}. Add these as fields or remove them from the template.`;
  }

  return null;
}


// Auto-generate template from fields
function generateTemplateFromFields(fields: FieldRow[]): string {
  const header = "You are a [define here]";

  if (fields.length === 0) {
    return header;
  }

  const fieldLines = fields
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
                {"⚠️"} {important}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
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
  const [globalFields, setGlobalFields] = useState<FieldRow[]>([]);
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
    return embedUrl ? `https://YOUR_SCAFFOLD_DOMAIN${embedUrl}` : "";
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

  async function refreshGlobalFields(appId: string) {
    if (!appId) return;
    const res = await fetch(`/api/global-fields?app_id=${encodeURIComponent(appId)}`);
    const data = await safeJson(res);
    if (data?.success) setGlobalFields(data.fields || []);
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

      // Only load saved template if one exists and we aren't skipping it (e.g. after a manual save)
      if (!options?.skipSetTemplate) {
        if (rows.length && rows[0]?.template) {
          setTemplate(rows[0].template);
          setLastSavedTemplate(rows[0].template);
        } else {
          // If no template exists in DB, set to the default "fresh start" state
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
    setGlobalFields([]);
    setTasks([]);
    setTemplates([]);
    refreshGlobalFields(selectedAppId);
    refreshTasks();
    refreshTemplates(selectedAppId, selectedTaskName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppId]);

  useEffect(() => {
    if (!selectedAppId || !selectedTaskName) return;
    setTaskFields([]);
    // We don't clear 'template' here to allow manual edits, 
    // but refreshTemplates will update it soon.
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
      setStatus(`[X] Create app failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("[OK] App created");

    setNewAppName("");
    await refreshApps();
    if (data.app?.id) setSelectedAppId(data.app.id);
  }

  async function createTask() {
    setStatus("");

    if (!selectedAppId) {
      setStatus("[X] Select an app first");
      return;
    }

    const name = newTaskName.trim();
    if (!name) {
      setStatus("[X] Task name required");
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
      setStatus(`[X] Create task failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("[OK] Task created");
    setNewTaskName("");
    await refreshTasks();
    setSelectedTaskName(name);
  }

  async function addGlobalField(f: Partial<FieldRow>) {
    if (!selectedAppId) return;
    setStatus("");
    const res = await fetch("/api/global-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: selectedAppId, ...f }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`[X] Add global field failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("[OK] Global field added");
    await refreshGlobalFields(selectedAppId);
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
      setStatus(`[X] Add task field failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("[OK] Task field added");
    await refreshTaskFields(selectedAppId, selectedTaskName);
  }

  // ✅ UPDATED: saveTemplate now includes validation
  async function deleteGlobalField(fieldId: string) {
    if (!selectedAppId) return;
    if (!confirm("Are you sure you want to delete this global field?")) return;

    setStatus("");
    const res = await fetch(`/api/global-fields?id=${fieldId}`, {
      method: "DELETE",
    });
    const data = await safeJson(res);

    if (!data?.success) {
      setStatus(`[X] Delete global field failed: ${data?.error || "unknown error"}`);
      return;
    }

    setStatus("✅ Global field deleted");
    await refreshGlobalFields(selectedAppId);
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
      setStatus(`[X] Delete task field failed: ${data?.error || "unknown error"}`);
      return;
    }

    setStatus("✅ Task field deleted");
    await refreshTaskFields(selectedAppId, selectedTaskName);
  }

  async function saveTemplate() {
    if (!selectedAppId || !selectedTaskName) {
      setStatus("[X] Select app + task first");
      return;
    }

    // ✅ NEW: Validate template before saving
    const allFields = [...globalFields, ...taskFields];
    const warning = validateTemplate(template, allFields);

    if (warning) {
      setStatus(warning);
      // Still allow save, just warn
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
      setStatus(`[X] Save template failed: ${data?.error || "unknown error"}`);
      return;
    }

    // Show validation warning if exists, otherwise success
    if (warning) {
      setStatus(`${warning}\n\n✅ Template saved anyway (fix the warnings above)`);
    } else {
      setStatus("✅ Template saved");
      setLastSavedTemplate(template);
      // We refresh the template list but SKIP setting the textarea state
      // so the user's current cursor position and content remain untouched.
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
            Add {kind === "global" ? "Global" : "Task"} Field
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
              {"If you do not want defaults in FREE, just leave this blank."}
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

  const nextGlobalOrder = (globalFields?.reduce((m, f) => Math.max(m, f.order || 0), 0) || 0) + 1;
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
            <div className="mt-2 text-xs text-gray-500 font-mono break-all">
              Example (deployed): {prodEmbedUrlHint}
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <FieldCreator kind="global" onAdd={addGlobalField} nextOrder={nextGlobalOrder} />

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="font-semibold mb-2 flex items-center">
                Global fields
                <InfoTooltip
                  title="Global Fields"
                  purpose="Fields shared across ALL tasks in this app."
                  whatItDoes="Asks the user for this info once, and reuses it everywhere."
                  example="User Name, Job Title, Company Name"
                  whenToUse="Use for profile-level info that does not change often."
                />
              </div>
              <div className="text-sm text-gray-600 mb-3">
                These show once (profile) and can be reused across tasks.
              </div>

              <ul className="space-y-2 text-sm">
                {globalFields.map((f) => (
                  <li key={f.id} className="relative rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{f.field_label}</div>
                      <div className="text-xs text-gray-500">
                        {f.required ? "required" : "optional"} {"·"} {f.field_type} {"·"} order {f.order}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 font-mono">{`{{${f.field_name}}}`}</div>
                    <button
                      onClick={() => deleteGlobalField(f.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                      title="Delete field"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </li>
                ))}
                {!globalFields.length && (
                  <li className="text-gray-500">No global fields yet.</li>
                )}
              </ul>
            </div>
          </div>

          <div>
            <FieldCreator kind="task" onAdd={addTaskField} nextOrder={nextTaskOrder} />

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <div className="font-semibold mb-2 flex items-center">
                Task fields
                <InfoTooltip
                  title="Task Fields"
                  purpose="Fields specific to THIS task only."
                  whatItDoes="Asks the user for info needed just for this specific action."
                  example="Email Recipient, Tone, Recipe Ingredients"
                  whenToUse="Use for inputs that change every time the user runs this task."
                />
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {"These show every time for task:"} <span className="font-mono">{selectedTaskName}</span>
              </div>

              <ul className="space-y-2 text-sm">
                {taskFields.map((f) => (
                  <li key={f.id} className="relative rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{f.field_label}</div>
                      <div className="text-xs text-gray-500">
                        {f.required ? "required" : "optional"} {"·"} {f.field_type} {"·"} order {f.order}
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
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </li>
                ))}
                {!taskFields.length && <li className="text-gray-500">No task fields yet.</li>}
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
          <p className="text-gray-600 text-sm mt-1">
            Your template will auto-generate as you add fields. Customize the instructions as needed.
          </p>

          <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-4 text-sm">
            <div className="font-semibold text-green-900 mb-2">Example: Prompt Template</div>
            <pre className="font-mono text-xs text-green-800 whitespace-pre-wrap">
              {`You are a professional writing assistant.

Recipient: {{recipient}}
Subject: {{subject}}
Tone: {{tone}}`}
            </pre>
            <p className="text-xs text-green-700 mt-2">
              ℹ️ Your template will auto-generate as you add fields. Customize the instructions as needed.
            </p>
          </div>

          <textarea
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
            rows={10}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />

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
                const allFields = [...globalFields, ...taskFields];
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