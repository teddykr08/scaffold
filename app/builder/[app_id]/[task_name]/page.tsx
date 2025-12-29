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

function validateTemplate(template: string, fields: FieldRow[]): string | null {
    const templateVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
    const fieldNames = fields.map(f => f.field_name);
    const missing = templateVars.filter(v => !fieldNames.includes(v) && v !== "system_header");

    if (missing.length > 0) {
        return `⚠️ Template uses undefined variables: ${missing.join(", ")}. Add these as fields or remove them from the template.`;
    }

    return null;
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
    const [globalFields, setGlobalFields] = useState<FieldRow[]>([]);

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
        refreshGlobalFields();
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

    async function refreshGlobalFields() {
        if (!appId) return;
        const res = await authenticatedFetch(
            `/api/global-fields?app_id=${encodeURIComponent(appId)}`
        );
        const data = await safeJson(res);
        if (data?.success) setGlobalFields(data.fields || []);
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

        const allFields = [...globalFields, ...taskFields];
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
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="font-bold text-lg text-gray-900">
                        Add New Field
                    </div>
                    <div className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500 font-mono">order: {nextOrder}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Label</label>
                        <input
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            value={label}
                            onChange={(e) => {
                                setLabel(e.target.value);
                                if (!name) setName(slugifyFieldName(e.target.value));
                            }}
                            placeholder="e.g. Your Name"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Field Name (API)</label>
                        <input
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                            value={name}
                            onChange={(e) => setName(slugifyFieldName(e.target.value))}
                            placeholder="e.g. user_name"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
                        <select
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            value={type}
                            onChange={(e) => setType(e.target.value as FieldType)}
                        >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text (Textarea)</option>
                            <option value="number">Number</option>
                            <option value="select">Dropdown (Select)</option>
                        </select>
                    </div>

                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={required}
                                    onChange={(e) => setRequired(e.target.checked)}
                                />
                                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Required Field</span>
                        </label>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        className="w-full md:w-auto rounded-xl bg-black px-8 py-3 text-white font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        disabled={!label.trim()}
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
                        Add Field
                    </button>
                </div>
            </div>
        );
    }

    const nextTaskOrder = (taskFields?.reduce((m, f) => Math.max(m, f.order || 0), 0) || 0) + 1;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg animate-pulse">Loading editor...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <main className="min-h-screen bg-white text-gray-900 pb-20">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Header with navigation */}
                <div className="mb-10">
                    <Link
                        href={`/builder/${appId}`}
                        className="text-sm text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 transition-colors font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to {app?.name || 'Project'}
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-5xl font-extrabold tracking-tighter text-black">{taskName}</h1>
                            <p className="text-gray-500 mt-2 text-lg font-medium">Configure fields and prompt logic</p>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className={`mb-8 rounded-2xl border px-6 py-4 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${status.includes('❌') ? 'bg-red-50 border-red-100 text-red-800' : 'bg-gray-50 border-gray-200 text-black'}`}>
                        <span className="whitespace-pre-line">{status}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: UI & Fields */}
                    <div className="lg:col-span-12 space-y-8">
                        {/* Embed URL Section */}
                        <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                </div>
                                <h2 className="font-bold text-xl">Embed Snippet</h2>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">
                                Copy this URL to iframe the form into your website.
                            </p>

                            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 font-mono text-sm break-all select-all hover:bg-gray-100 transition-colors cursor-pointer" title="Click to select all">
                                {embedUrl || "Loading..."}
                            </div>

                            {prodEmbedUrlHint && (
                                <div className="mt-6 rounded-2xl bg-blue-50/50 border border-blue-100 p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Pro Tip</span>
                                    </div>
                                    <h4 className="font-bold text-blue-900 mb-2">Dynamic Context</h4>
                                    <p className="text-blue-800 text-sm leading-relaxed mb-4">
                                        Pass hidden context to your prompts using the <code className="bg-blue-100 px-1 rounded text-blue-900 font-mono text-xs">fixed</code> parameter:
                                    </p>
                                    <div className="bg-white border border-blue-100 rounded-lg p-3 text-xs font-mono text-blue-600 break-all shadow-sm">
                                        {prodEmbedUrlHint}&fixed=your+context+here
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Field Management */}
                        <div className="space-y-6">
                            <FieldCreator kind="task" onAdd={addTaskField} nextOrder={nextTaskOrder} />

                            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                                <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    Active Fields
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{taskFields.length + globalFields.length}</span>
                                </h2>

                                <div className="space-y-3">
                                    {/* Global Fields */}
                                    {globalFields.filter(f => f.field_type !== "runtime").map((f) => (
                                        <div key={f.id} className="group relative rounded-xl border border-blue-100 bg-blue-50/20 p-4 transition-all hover:border-blue-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-bold text-blue-900 flex items-center gap-2 uppercase text-xs tracking-wider">
                                                    {f.field_label}
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black">Global</span>
                                                </div>
                                                <div className="text-[10px] text-blue-500 font-bold">
                                                    {f.required ? "REQUIRED" : "OPTIONAL"} · {f.field_type.toUpperCase()} · ORD {f.order}
                                                </div>
                                            </div>
                                            <div className="text-xs text-blue-400 font-mono">{`{{${f.field_name}}}`}</div>
                                        </div>
                                    ))}

                                    {/* Task Fields */}
                                    {taskFields.filter(f => f.field_type !== "runtime").map((f) => (
                                        <div key={f.id} className="group relative rounded-xl border border-gray-200 p-4 transition-all hover:border-gray-400 hover:shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-bold text-gray-900 uppercase text-xs tracking-wider">{f.field_label}</div>
                                                <div className="text-[10px] text-gray-500 font-bold">
                                                    {f.required ? "REQUIRED" : "OPTIONAL"} · {f.field_type.toUpperCase()} · ORD {f.order}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">{`{{${f.field_name}}}`}</div>
                                            <button
                                                onClick={() => deleteTaskField(f.id)}
                                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete field"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {(!taskFields.filter(f => f.field_type !== "runtime").length && !globalFields.filter(f => f.field_type !== "runtime").length) && (
                                        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                            <p className="text-gray-400 font-medium">No fields added yet. Add your first field above!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Template Section */}
                        <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-bold text-xl mb-1">Prompt Template</h2>
                                    <p className="text-gray-500 text-sm">Design the final prompt that gets sent to ChatGPT.</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors ${template === lastSavedTemplate ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {template === lastSavedTemplate ? '✓ Synced' : '● Unsaved'}
                                </div>
                            </div>

                            <div className="relative group">
                                <textarea
                                    className="w-full rounded-2xl border border-gray-300 p-6 font-mono text-sm leading-relaxed focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all resize-y min-h-[300px] bg-gray-50/30 group-hover:bg-white"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    placeholder="e.g. You are an expert chef. Write a recipe for {{dish_name}}..."
                                />
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-xs text-gray-400">
                                    Tip: Use <code className="bg-gray-100 px-1 rounded text-gray-700">{"{{field_name}}"}</code> to inject form data.
                                </div>
                                <button
                                    className={`rounded-xl px-10 py-4 text-white font-bold transition-all shadow-lg ${template === lastSavedTemplate
                                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                                        : "bg-black hover:bg-gray-800 hover:shadow-xl active:scale-95"
                                        }`}
                                    onClick={saveTemplate}
                                    disabled={template === lastSavedTemplate}
                                >
                                    {template === lastSavedTemplate ? "Saved" : "Save Logic"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
