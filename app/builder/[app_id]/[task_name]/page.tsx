"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import HelpTooltip from "../../../components/HelpTooltip";
import TemplateImproverPopup from "../../../components/TemplateImproverPopup";
import ActionMenu from "../../../components/ActionMenu";

// Create a single shared Supabase client instance
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
    custom_color?: string | null;
    font?: string | null;
};

type FieldType = "text" | "textarea" | "select" | "number" | "runtime" | "media";

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
    min?: number | null;
    max?: number | null;
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
    console.log("authenticatedFetch called:", url, options.method);
    const { isPublic = false, ...fetchOptions } = options;

    if (!isPublic) {
        console.log("Getting Supabase session...");
        
        const {
            data: { session },
        } = await supabase.auth.getSession();
        console.log("Session retrieved:", !!session);

        if (session?.access_token) {
            fetchOptions.headers = {
                ...fetchOptions.headers,
                Authorization: `Bearer ${session.access_token}`,
            };
        }
    }

    console.log("About to fetch:", url);
    const result = await fetch(url, fetchOptions);
    console.log("Fetch completed:", result.status);
    return result;
}

function validateTemplate(template: string, fields: FieldRow[]): string | null {
    const templateVars = [...template.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
    // Only include non-media fields in validation
    const fieldNames = fields.filter(f => f.field_type !== "media").map(f => f.field_name);
    const missing = templateVars.filter(v => !fieldNames.includes(v) && v !== "system_header");

    if (missing.length > 0) {
        return `⚠️ Template uses undefined variables: ${missing.join(", ")}. Add these as fields or remove them from the template.`;
    }

    return null;
}

// Extract FieldCreator completely outside the main component
function FieldCreator({
    kind,
    onAdd,
    nextOrder,
    editingField,
    onUpdate,
    onCancelEdit,
}: {
    kind: "global" | "task";
    onAdd: (f: Partial<FieldRow>) => Promise<void>;
    nextOrder: number;
    editingField?: FieldRow | null;
    onUpdate?: (fieldId: string, updates: Partial<FieldRow>) => Promise<void>;
    onCancelEdit?: () => void;
}) {
    const [label, setLabel] = useState("");
    const [name, setName] = useState("");
    const [type, setType] = useState<FieldType>("text");
    const [required, setRequired] = useState(true);
    const [options, setOptions] = useState<string>("");
    const [hasMin, setHasMin] = useState(false);
    const [hasMax, setHasMax] = useState(false);
    const [minValue, setMinValue] = useState<string>("0");
    const [maxValue, setMaxValue] = useState<string>("100");

    // Update form when editingField changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (editingField) {
            setLabel(editingField.field_label);
            setName(editingField.field_name);
            setType(editingField.field_type);
            setRequired(editingField.required);
            // Handle options for different field types
            if (editingField.field_type === "select") {
                setOptions(editingField.options?.join("\n") || "");
            } else if (editingField.field_type === "media") {
                setOptions(Array.isArray(editingField.options) ? editingField.options[0] || "" : "");
            } else {
                setOptions("");
            }
            setHasMin(editingField.min != null);
            setHasMax(editingField.max != null);
            setMinValue(editingField.min?.toString() || "0");
            setMaxValue(editingField.max?.toString() || "100");
        } else {
            // Reset form when not editing
            setLabel("");
            setName("");
            setType("text");
            setRequired(true);
            setOptions("");
            setHasMin(false);
            setHasMax(false);
            setMinValue("0");
            setMaxValue("100");
        }
    }, [editingField]);

    // Initialize options when type changes to media
    useEffect(() => {
        if (type === "media" && !options && !editingField) {
            setOptions("text:");
        }
        // Auto-generate name for media fields
        if (type === "media" && !editingField) {
            setName("");
        }
    }, [type, editingField]);

    const handleSave = async () => {
        console.log("handleSave called, editingField:", editingField);
        if (editingField && onUpdate) {
            console.log("Calling onUpdate with id:", editingField.id);
            const updates: Partial<FieldRow> = {
                field_label: label.trim(),
                field_name: slugifyFieldName(name || label),
                field_type: type,
                required,
            };
            if (type === "number") {
                updates.min = hasMin ? parseFloat(minValue) : null;
                updates.max = hasMax ? parseFloat(maxValue) : null;
            }
            if (type === "select") {
                updates.options = options.split("\n").map(o => o.trim()).filter(Boolean);
            }
            if (type === "media") {
                updates.options = [options];
            }
            console.log("Update data:", updates);
            await onUpdate(editingField.id, updates);
            console.log("onUpdate completed, waiting before clearing form...");
            
            // Wait a bit for the state to settle
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (onCancelEdit) {
                console.log("Calling onCancelEdit to clear edit mode");
                onCancelEdit();
            }
        } else {
            console.log("Adding new field");
            const fieldData: Partial<FieldRow> = {
                field_label: label.trim(),
                field_name: type === "media" ? `media_${Date.now()}` : slugifyFieldName(name || label),
                field_type: type,
                required: type === "media" ? false : required,
                order: nextOrder,
                options: null,
                default_value: null,
            };
            if (type === "number") {
                fieldData.min = hasMin ? parseFloat(minValue) : null;
                fieldData.max = hasMax ? parseFloat(maxValue) : null;
            }
            if (type === "select") {
                fieldData.options = options.split("\n").map(o => o.trim()).filter(Boolean);
            }
            if (type === "media") {
                fieldData.options = [options]; // Store image URL or text content as array
            }
            await onAdd(fieldData);
            
            // Reset form after successful add
            setLabel("");
            setName("");
            setType("text");
            setRequired(true);
            setOptions("");
            setHasMin(false);
            setHasMax(false);
            setMinValue("0");
            setMaxValue("100");
        }
    };

    return (
        <div data-tour="add-field" className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="font-bold text-lg text-gray-900">
                    {editingField ? "Edit Field" : "Add New Field"}
                </div>
                {editingField && onCancelEdit && (
                    <button
                        onClick={onCancelEdit}
                        className="text-sm text-gray-500 hover:text-black font-semibold"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Label
                        <span className="block text-[10px] normal-case font-medium text-gray-400 mt-0.5">this will be in the question field on the form</span>
                    </label>
                    <input
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value);
                            if (!name && !editingField && type !== "media") setName(slugifyFieldName(e.target.value));
                        }}
                        placeholder="e.g. Your Name"
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Field Name (API)</label>
                    <input
                        className={`w-full rounded-xl border border-gray-300 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black ${type === "media" ? "bg-gray-100" : "bg-white"}`}
                        value={name}
                        onChange={(e) => setName(slugifyFieldName(e.target.value))}
                        placeholder={type === "media" ? "Not used for media" : "e.g. user_name"}
                        disabled={!!editingField || type === "media"}
                    />
                    {type === "media" && (
                        <div className="text-xs text-gray-500 mt-1">Media fields don&apos;t participate in prompts</div>
                    )}
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
                        <option value="media">Media (Display Only)</option>
                    </select>
                </div>

                <div className="flex items-end pb-2">
                    <label className={`flex items-center gap-3 ${type === "media" ? "cursor-not-allowed opacity-50" : "cursor-pointer group"}`}>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={required}
                                onChange={(e) => setRequired(e.target.checked)}
                                disabled={type === "media"}
                            />
                            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                        </div>
                        <span className={`text-sm font-semibold ${type === "media" ? "text-gray-400" : "text-gray-700 group-hover:text-black"} transition-colors`}>Required Field</span>
                    </label>
                    {type === "media" && (
                        <div className="text-xs text-gray-500 ml-2">N/A for display fields</div>
                    )}
                </div>
            </div>

            {/* Number Field Min/Max */}
            {type === "number" && (
                <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Number Constraints</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer group mb-2">
                                <input
                                    type="checkbox"
                                    checked={hasMin}
                                    onChange={(e) => setHasMin(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-semibold text-gray-700">Set Minimum</span>
                            </label>
                            {hasMin && (
                                <input
                                    type="number"
                                    value={minValue}
                                    onChange={(e) => setMinValue(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
                                    placeholder="Min value"
                                />
                            )}
                        </div>
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer group mb-2">
                                <input
                                    type="checkbox"
                                    checked={hasMax}
                                    onChange={(e) => setHasMax(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-semibold text-gray-700">Set Maximum</span>
                            </label>
                            {hasMax && (
                                <input
                                    type="number"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
                                    placeholder="Max value"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dropdown Options */}
            {type === "select" && (
                <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                    <label className="text-xs font-bold text-gray-700 mb-2 block uppercase tracking-wider">Dropdown Options (one per line)</label>
                    <textarea
                        value={options}
                        onChange={(e) => setOptions(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm font-mono min-h-[120px]"
                        placeholder={"option 1\noption 2\noption 3"}
                    />
                    <div className="text-xs text-gray-500 mt-2">Each line will become one option in the dropdown</div>
                </div>
            )}

            {/* Media Content Options */}
            {type === "media" && (
                <div className="mt-4 p-4 bg-green-50/50 rounded-xl border border-green-100">
                    <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Media Content Type</div>
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={options?.startsWith('image:') || false}
                                onChange={() => setOptions('image:')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold">Image</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={options?.startsWith('text:') || false}
                                onChange={() => setOptions('text:')}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold">Text Box</span>
                        </label>
                    </div>
                    
                    {options?.startsWith('image:') && (
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-2 block">Image URL</label>
                            <input
                                type="url"
                                value={options.replace('image:', '')}
                                onChange={(e) => setOptions('image:' + e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
                                placeholder="https://example.com/menu.jpg"
                            />
                            <div className="text-xs text-gray-500 mt-2">Paste the exact URL of your image (Click &quot;Copy Image Address&quot; on browser)</div>
                        </div>
                    )}
                    
                    {options?.startsWith('text:') && (
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-2 block">Display Text</label>
                            <textarea
                                value={options.replace('text:', '')}
                                onChange={(e) => setOptions('text:' + e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm font-mono min-h-[200px]"
                                placeholder="Enter text to display (e.g., menu items, instructions, etc.)"
                            />
                            <div className="text-xs text-gray-500 mt-2">This text will be displayed but won&apos;t be part of the prompt</div>
                        </div>
                    )}
                    
                    <div className="mt-3 p-3 bg-green-100/50 rounded-lg">
                        <div className="text-xs text-green-800">
                            <strong>📌 Note:</strong> Media fields display content to users but don&apos;t send data to the AI. Perfect for showing reference material like menus, examples, or instructions.
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 flex items-center gap-3">
                <button
                    type="button"
                    className="w-full md:w-auto rounded-xl bg-scaffold-brand px-8 py-3 text-black font-graffiti text-lg hover:bg-scaffold-brandHover transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={!label.trim() || (type === "select" && !options.trim())}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSave();
                    }}
                >
                    {editingField ? "Save Edits" : "Add Field"}
                </button>
            </div>
        </div>
    );
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

    const [useFixedPrompt, setUseFixedPrompt] = useState(false);

    // Customization State
    const [theme, setTheme] = useState("default");
    const [customColor, setCustomColor] = useState("#000000");
    const [font, setFont] = useState("Inter");
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [previewKey, setPreviewKey] = useState(0); // Force iframe reload
    const [isImproverOpen, setIsImproverOpen] = useState(false);
    const [editingField, setEditingField] = useState<FieldRow | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    // Section refs for tutorial scroll
    const embedSectionRef = useRef<HTMLDivElement>(null);
    const fieldSectionRef = useRef<HTMLDivElement>(null);
    const templateSectionRef = useRef<HTMLDivElement>(null);

    // Expose scrollToSection function for tutorial
    useEffect(() => {
        (window as any).scrollToSection = (sectionName: string) => {
            const refs: Record<string, React.RefObject<HTMLDivElement>> = {
                embed: embedSectionRef,
                fields: fieldSectionRef,
                template: templateSectionRef,
            };
            const ref = refs[sectionName];
            if (ref?.current) {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        };
        return () => {
            delete (window as any).scrollToSection;
        };
    }, []);

    // Log environment variables on mount
    useEffect(() => {
        console.log('[Task Editor] Environment variables check:');
        console.log('  NEXT_PUBLIC_HELP_APP_ID:', process.env.NEXT_PUBLIC_HELP_APP_ID || 'NOT SET');
        console.log('  NEXT_PUBLIC_IMPROVER_APP_ID:', process.env.NEXT_PUBLIC_IMPROVER_APP_ID || 'NOT SET');
    }, []);

    const embedUrl = useMemo(() => {
        if (!appId || !taskName) return "";
        // Use values from task object if available and are strings, otherwise use state
        const color = typeof task?.custom_color === 'string' && task.custom_color ? task.custom_color : (customColor || '#000000');
        const fontFamily = typeof task?.font === 'string' && task.font ? task.font : (font || 'Inter');
        return `/embed/form?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}&color=${encodeURIComponent(color)}&font=${encodeURIComponent(fontFamily)}`;
    }, [appId, taskName, task?.custom_color, task?.font, customColor, font]);

    const prodEmbedUrlHint = useMemo(() => {
        return embedUrl ? `https://scaffoldtool.vercel.app${embedUrl}` : "";
    }, [embedUrl]);

    // Ref to prevent multiple simultaneous refreshes
    const isRefreshingRef = useRef(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        
        // Start loading data immediately when we have user, appId, and taskName
        if (user && appId && taskName && !isRefreshingRef.current) {
            console.log('[TaskBuilder] User, appId, and taskName found, fetching data...');
            isRefreshingRef.current = true;
            setDataLoading(true);
            
            // Parallel data fetch for faster loading
            Promise.all([
                refreshApp(),
                refreshTask(),
                refreshTaskFields(),
                refreshTemplates()
            ]).then(() => {
                console.log('[TaskBuilder] All data loaded');
                window.dispatchEvent(new CustomEvent('scaffold-editor-loaded'));
            }).finally(() => {
                isRefreshingRef.current = false;
                setDataLoading(false);
            });

            if (taskName.toLowerCase().includes("recipe")) {
                setUseFixedPrompt(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading, appId, taskName]);

    // Listen for template improved event
    useEffect(() => {
        const handleTemplateImproved = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.template) {
                setTemplate(customEvent.detail.template);
                setStatus("✅ Template updated! Don't forget to save.");
                setTimeout(() => setStatus(""), 3000);
            }
        };

        window.addEventListener("templateImproved", handleTemplateImproved);
        return () => window.removeEventListener("templateImproved", handleTemplateImproved);
    }, []);

    async function refreshApp() {
        try {
            const res = await authenticatedFetch("/api/apps", { method: "GET" });
            const data = await safeJson(res);
            if (data?.success) {
                const foundApp = (data.apps || []).find((a: AppRow) => a.id === appId);
                setApp(foundApp || null);
                // Share app name with navbar immediately
                if (foundApp?.name) {
                    window.dispatchEvent(new CustomEvent('scaffold-app-name', { 
                        detail: { appId, name: foundApp.name } 
                    }));
                }
            }
        } catch (error) {
            console.error("Error refreshing app:", error);
        }
    }

    async function refreshTask() {
        if (!appId) return;
        try {
            const res = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(appId)}`);
            const data = await safeJson(res);
            if (data?.success) {
                const foundTask = (data.tasks || []).find((t: TaskRow) => t.name === taskName);
                if (foundTask) {
                    console.log('[refreshTask] Found task with customization:', {
                        theme: foundTask.theme,
                        custom_color: foundTask.custom_color,
                        font: foundTask.font
                    });
                    setTask(foundTask);
                    // Ensure we set the customization values from the database
                    const dbTheme = foundTask.theme || "default";
                    const dbColor = foundTask.custom_color || "#000000";
                    const dbFont = foundTask.font || "Inter";
                    
                    // Use a callback to ensure state updates are batched properly
                    setTheme(dbTheme);
                    setCustomColor(dbColor);
                    setFont(dbFont);
                    
                    console.log('[refreshTask] Set customization to:', { 
                        theme: dbTheme, 
                        color: dbColor, 
                        font: dbFont 
                    });
                } else {
                    setTask(null);
                }
            }
        } catch (error) {
            console.error("Error refreshing task:", error);
        }
    }

    async function refreshTaskFields() {
        if (!appId || !taskName) return;
        console.log("[refreshTaskFields] Starting refresh...");
        try {
            const res = await authenticatedFetch(
                `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`
            );
            const data = await safeJson(res);
            console.log("[refreshTaskFields] Data received:", data?.success, "Fields count:", data?.fields?.length);
            if (data?.success) {
                setTaskFields(data.fields || []);
                console.log("[refreshTaskFields] State updated with", data.fields?.length, "fields");
            }
        } catch (error) {
            console.error("Error refreshing task fields:", error);
        }
    }



    async function refreshTemplates() {
        if (!appId || !taskName) return;
        try {
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
        } catch (error) {
            console.error("Error refreshing templates:", error);
        }
    }

    async function addTaskField(f: Partial<FieldRow>) {
        if (!appId || !taskName) return;
        setStatus("");
        
        // Optimistic update - add field immediately
        const tempField: FieldRow = {
            id: 'temp-' + Date.now(),
            app_id: appId,
            task_name: taskName,
            field_name: f.field_name || '',
            field_label: f.field_label || '',
            field_type: f.field_type || 'text',
            required: f.required ?? true,
            order: f.order || taskFields.length,
            created_at: new Date().toISOString(),
            options: f.options || null,
            default_value: f.default_value || null,
            min: f.min,
            max: f.max
        };
        setTaskFields(prevFields => [...prevFields, tempField]);
        
        const res = await authenticatedFetch("/api/task-fields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ app_id: appId, task_name: taskName, ...f }),
        });
        const data = await safeJson(res);
        if (!data?.success) {
            setStatus(`❌ Add task field failed: ${data?.error || "unknown error"}`);
            // Revert optimistic update
            setTaskFields(prevFields => prevFields.filter(field => field.id !== tempField.id));
            return;
        }
        setStatus("✅ Task field added");
        window.dispatchEvent(new CustomEvent('scaffold-field-added'));
        await refreshTaskFields();
    }

    async function updateTaskField(fieldId: string, updates: Partial<FieldRow>) {
        console.log("updateTaskField called with:", fieldId, updates);
        if (!appId || !taskName) {
            console.log("Missing appId or taskName");
            return;
        }
        setStatus("");
        
        // Optimistic update - apply changes immediately
        setTaskFields(prevFields => 
            prevFields.map(field => 
                field.id === fieldId ? { ...field, ...updates } : field
            )
        );
        
        console.log("About to call API...");
        try {
            const res = await authenticatedFetch("/api/task-fields", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: fieldId, ...updates }),
            });
            console.log("API response received:", res.status);
            const data = await safeJson(res);
            console.log("API data:", data);
            if (!data?.success) {
                setStatus(`❌ Update field failed: ${data?.error || "unknown error"}`);
                console.log("Update failed:", data?.error);
                // Revert optimistic update
                await refreshTaskFields();
                return;
            }
            setStatus("✅ Field updated");
            console.log("About to refresh fields...");
            await refreshTaskFields();
            console.log("Fields refreshed");
        } catch (error) {
            console.error("Error in updateTaskField:", error);
            setStatus(`❌ Update failed: ${error}`);
            // Revert optimistic update
            await refreshTaskFields();
        }
    }

    async function deleteTaskField(fieldId: string) {
        if (!appId || !taskName) return;
        if (!confirm("Are you sure you want to delete this task field?")) return;

        setStatus("");
        
        // Optimistic update - remove immediately
        const deletedField = taskFields.find(f => f.id === fieldId);
        setTaskFields(prevFields => prevFields.filter(field => field.id !== fieldId));
        
        const res = await authenticatedFetch(`/api/task-fields?id=${fieldId}`, {
            method: "DELETE",
        });
        const data = await safeJson(res);

        if (!data?.success) {
            setStatus(`❌ Delete task field failed: ${data?.error || "unknown error"}`);
            // Revert optimistic update
            if (deletedField) {
                setTaskFields(prevFields => [...prevFields, deletedField].sort((a, b) => a.order - b.order));
            }
            return;
        }

        setStatus("✅ Task field deleted");
        await refreshTaskFields();
    }

    async function moveFieldUp(fieldId: string) {
        const fieldIndex = taskFields.findIndex(f => f.id === fieldId);
        if (fieldIndex <= 0) return; // Already at top

        const newFields = [...taskFields];
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = [newFields[fieldIndex], newFields[fieldIndex - 1]];
        
        // Update orders
        newFields.forEach((field, idx) => {
            field.order = idx;
        });
        
        setTaskFields(newFields);
        
        // Save new order to database
        await Promise.all(newFields.map(field => 
            authenticatedFetch("/api/task-fields", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: field.id, order: field.order })
            })
        ));
    }

    async function moveFieldDown(fieldId: string) {
        const fieldIndex = taskFields.findIndex(f => f.id === fieldId);
        if (fieldIndex >= taskFields.length - 1) return; // Already at bottom

        const newFields = [...taskFields];
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
        
        // Update orders
        newFields.forEach((field, idx) => {
            field.order = idx;
        });
        
        setTaskFields(newFields);
        
        // Save new order to database
        await Promise.all(newFields.map(field => 
            authenticatedFetch("/api/task-fields", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: field.id, order: field.order })
            })
        ));
    }

    async function saveCustomization() {
        // Debug guard to ensure we have a task ID
        if (!task?.id) {
            console.warn("saveCustomization called without task id", { task });
            setStatus("❌ Missing task id");
            return;
        }

        setIsSavingSettings(true);
        setStatus("Saving customization...");

        try {
            console.log("saveCustomization -> sending", {
                id: task.id,
                theme,
                custom_color: customColor,
                font,
            });

            const res = await authenticatedFetch("/api/tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: task.id,
                    theme,
                    custom_color: customColor,
                    font,
                }),
            });

            console.log("saveCustomization response status", res.status);
            const data = await safeJson(res);
            console.log("saveCustomization response body", data);

            if (data?.success) {
                setStatus("✅ Customization saved!");
                
                // Update iframe URL with color and font from PUT response
                const iframe = document.querySelector('iframe[src*="/embed/form"]') as HTMLIFrameElement;
                if (iframe) {
                    const url = new URL(iframe.src);
                    url.searchParams.set('color', data.task.custom_color || customColor);
                    url.searchParams.set('font', data.task.font || font);
                    url.searchParams.set('v', Date.now().toString()); // cache bust
                    iframe.src = url.toString();
                    console.log("Updated iframe src with customization data:", url.toString());
                }
            } else {
                setStatus(`❌ Failed to save: ${data?.error}`);
            }
        } catch (err: any) {
            console.error("saveCustomization error", err);
            setStatus(`❌ Failed to save: ${err?.message || "unknown error"}`);
        } finally {
            setIsSavingSettings(false);
        }
    }

    async function saveTemplate() {
        if (!appId || !taskName) {
            setStatus("❌ Select app + task first");
            return;
        }

        const allFields = [...taskFields];
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

    const nextTaskOrder = useMemo(() => {
        return (taskFields?.reduce((m, f) => Math.max(m, f.order || 0), 0) || 0) + 1;
    }, [taskFields]);

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
        <main className="h-screen overflow-y-auto snap-y snap-proximity scroll-smooth bg-white text-gray-900">
            <div className="max-w-6xl mx-auto px-6">

                {status && (
                    <div className={`mt-4 mb-6 rounded-2xl border px-6 py-4 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${status.includes('❌') ? 'bg-red-50 border-red-100 text-red-800' : 'bg-gray-50 border-gray-200 text-black'}`}>
                        <span className="whitespace-pre-line">{status}</span>
                    </div>
                )}

                <div>
                    {/* Section 1: Embed Configuration */}
                    <section ref={embedSectionRef} data-section="embed" id="embed-section" className="min-h-screen snap-start flex flex-col py-8">
                        <div data-tour="embed-code" className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                </div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-xl">Embed Snippet</h2>
                                    <HelpTooltip term="embed_snippet" label="How do I use this?" />
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-6">
                                Copy this URL to iframe the form into your website.
                            </p>

                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100" data-tour="customization-section">
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customize Form Appearance</h3>
                                    <HelpTooltip term="form_customization" label="Appearance options" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Theme</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setTheme("default")}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border-2 ${theme === 'default'
                                                    ? "border-black bg-black text-white"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                    }`}
                                            >
                                                default
                                            </button>
                                            <span className="text-xs text-gray-400">More themes coming soon</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Font Family</label>
                                        <select
                                            value={font}
                                            onChange={(e) => setFont(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-black focus:outline-none"
                                        >
                                            {["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Raleway", "Merriweather", "Playfair Display", "Courier Prime", "VT323", "Orbitron"].map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Primary Color Theme</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <input
                                                    type="color"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="w-12 h-12 p-1 rounded-full border-2 border-gray-200 cursor-pointer overflow-hidden"
                                                    title="Choose color"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={customColor}
                                                    onChange={(e) => setCustomColor(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                            <button
                                                onClick={saveCustomization}
                                                disabled={isSavingSettings}
                                                className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                            >
                                                {isSavingSettings ? "Saving..." : "Save Look"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Open Form Preview Link */}
                            {prodEmbedUrlHint && (
                                <div className="flex justify-end mb-4">
                                    <a
                                        href={prodEmbedUrlHint}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                                    >
                                        Open Form Preview
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    </a>
                                </div>
                            )}
                            {embedUrl && (
                                <div className="mb-4" data-tour="preview-section">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Live Preview</label>
                                    <iframe
                                        data-tour="form-preview"
                                        key={previewKey}
                                        src={`${embedUrl}&v=${previewKey}`}
                                        className="w-full rounded-xl border border-gray-200 bg-white shadow-sm"
                                        style={{ height: "400px" }}
                                        title="Form preview"
                                    />
                                </div>
                            )}
                            <textarea
                                readOnly
                                className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 font-mono text-xs h-24 focus:outline-none focus:ring-2 focus:ring-black/5 transition-all mb-4"
                                value={embedUrl ? `<iframe
  src="https://scaffoldtool.vercel.app${embedUrl}${useFixedPrompt ? '&fixed=YOUR_FIXED_FIELD' : ''}"
  width="100%"
  height="600"
  frameborder="0">
</iframe>` : "Loading..."}
                                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                                title="Click to select all"
                            />
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100" data-tour="fixed-field-toggle">
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="fixed-prompt-toggle"
                                        checked={useFixedPrompt}
                                        onChange={(e) => setUseFixedPrompt(e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-scaffold-brand checked:bg-scaffold-brand transition-all duration-300"
                                        style={{ right: useFixedPrompt ? '0' : 'auto', left: useFixedPrompt ? 'auto' : '0' }}
                                    />
                                    <label
                                        htmlFor="fixed-prompt-toggle"
                                        className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${useFixedPrompt ? 'bg-black' : 'bg-gray-300'}`}
                                    ></label>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="fixed-prompt-toggle" className="text-sm font-bold text-gray-900 cursor-pointer select-none">
                                            Include Fixed Field?
                                        </label>
                                        <HelpTooltip term="fixed_field" label="What is this?" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        A &quot;fixed field&quot; is invisible context sent to the AI (e.g. current page URL, user ID).
                                        <br />
                                        <span className={`font-semibold transition-colors ${useFixedPrompt ? 'text-black delay-150 duration-500 bg-yellow-100 px-1 rounded' : 'text-gray-400'}`}>
                                            IMPORTANT: Replace <code className="font-mono text-xs">YOUR_FIXED_FIELD</code> in the code above with your actual data.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Field Management */}
                    <section ref={fieldSectionRef} data-section="fields" id="fields-section" className="min-h-screen snap-start flex flex-col py-8">
                        <div className="space-y-6" data-tour="fields-section">
                            <FieldCreator 
                                key="field-creator-stable"
                                kind="task" 
                                onAdd={addTaskField} 
                                nextOrder={nextTaskOrder} 
                                editingField={editingField}
                                onUpdate={updateTaskField}
                                onCancelEdit={() => setEditingField(null)}
                            />

                            <div className="rounded-2xl border border-gray-200 p-8 shadow-sm">
                                <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                                    Active Fields
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{taskFields.length}</span>
                                    <HelpTooltip term="form_fields" label="What are form fields?" />
                                </h2>

                                <div className="space-y-3">


                                    {/* Task Fields */}
                                    {taskFields.filter(f => f.field_type !== "runtime" && !f.field_label.toLowerCase().includes("additional instructions") && f.field_name !== "additional_instructions").map((f, index, array) => (
                                        <div key={f.id} className="group relative rounded-xl border border-gray-200 p-4 transition-all hover:border-gray-400 hover:shadow-sm flex items-center gap-4">
                                            {/* Reorder Arrows */}
                                            <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => moveFieldUp(f.id)}
                                                    disabled={index === 0}
                                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move up"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => moveFieldDown(f.id)}
                                                    disabled={index === array.length - 1}
                                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Move down"
                                                >
                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-bold text-gray-900 uppercase text-xs tracking-wider">{f.field_label}</div>
                                                    <div className="text-[10px] text-gray-500 font-bold">
                                                        {f.field_type === "media" ? "DISPLAY ONLY" : f.required ? "REQUIRED" : "OPTIONAL"} · {f.field_type.toUpperCase()}
                                                        {f.field_type === "number" && (f.min != null || f.max != null) && (
                                                            <span> · {f.min != null ? `MIN:${f.min}` : ""}{f.min != null && f.max != null ? " " : ""}{f.max != null ? `MAX:${f.max}` : ""}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {f.field_type !== "media" && (
                                                    <div className="text-xs text-gray-400 font-mono">{`{{${f.field_name}}}`}</div>
                                                )}
                                                {f.field_type === "select" && f.options && f.options.length > 0 && (
                                                    <div className="text-xs text-gray-500 mt-1">Options: {f.options.join(", ")}</div>
                                                )}
                                                {f.field_type === "media" && f.options && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {typeof f.options[0] === "string" && f.options[0].startsWith("image:")
                                                            ? `Image: ${f.options[0].substring(6)}`
                                                            : "Text content"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute top-1/2 -translate-y-1/2 right-4">
                                                <ActionMenu
                                                    onEdit={() => {
                                                        setEditingField(f);
                                                        // Scroll to top where the field creator is
                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                    }}
                                                    onDelete={() => deleteTaskField(f.id)}
                                                    itemType="field"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {(!taskFields.filter(f => f.field_type !== "runtime").length) && (
                                        <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                                            <p className="text-gray-400 font-medium">No fields added yet. Add your first field above!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Prompt Template */}
                    <section ref={templateSectionRef} data-section="template" id="template-section" className="min-h-screen snap-start flex flex-col py-8">
                        <div className="rounded-2xl border border-gray-200 p-8 shadow-sm" data-tour="prompt-section">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="font-bold text-xl">Prompt Template</h2>
                                        <HelpTooltip term="prompt_template" label="What is a prompt template?" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Design the final prompt that gets sent to ChatGPT.</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors ${template === lastSavedTemplate ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {template === lastSavedTemplate ? '✓ Synced' : '● Unsaved'}
                                </div>
                            </div>

                            {/* Example */}
                            <div className="mb-6 rounded-xl bg-blue-50/50 border border-blue-100 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">Example</span>
                                </div>
                                <p className="text-sm text-blue-900 font-medium mb-2">Taco Finder Task</p>
                                <div className="bg-white/60 rounded-lg p-3 font-mono text-xs text-blue-800 leading-relaxed">
                                    You are a taco expert. Help me find the best tacos.<br />
                                    Location: {`{{location}}`}<br />
                                    Preferred style: {`{{taco_style}}`}<br />
                                    <br />
                                    Provide 3 recommendations with addresses.
                                </div>
                            </div>

                            {/* Field Usage Sidebar */}
                            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50/30 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Available Fields</h3>
                                    <span className="text-[10px] text-gray-400 font-mono">Click to copy</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {taskFields.filter(f => f.field_type !== "runtime" && f.field_type !== "media").map((f) => {
                                        const isUsed = template.includes(`{{${f.field_name}}}`);
                                        return (
                                            <button
                                                key={f.id}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`{{${f.field_name}}}`);
                                                    setStatus(`✅ Copied {{${f.field_name}}}}`);
                                                    setTimeout(() => setStatus(""), 2000);
                                                }}
                                                className={`text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all hover:scale-105 active:scale-95 ${isUsed
                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                                    : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                                    }`}
                                                title={isUsed ? 'Used in template' : 'Not used in template'}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isUsed ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                                    <span className="truncate">{f.field_label}</span>
                                                </div>
                                                <div className="text-[10px] opacity-60 mt-0.5">{`{{${f.field_name}}}`}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="relative group">
                                <textarea
                                    data-tour="template-editor"
                                    className="w-full rounded-2xl border border-gray-300 p-6 font-mono text-sm leading-relaxed focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all resize-y min-h-[300px] bg-gray-50/30 group-hover:bg-white"
                                    value={template}
                                    onChange={(e) => {
                                        const textarea = e.currentTarget;
                                        const newValue = e.target.value;
                                        const cursorPos = textarea.selectionStart;
                                        
                                        // Check if user just typed a single {
                                        if (newValue.length > template.length) {
                                            const addedChar = newValue[cursorPos - 1];
                                            if (addedChar === "{") {
                                                // Check if it's not already part of {{
                                                const charBefore = cursorPos >= 2 ? newValue[cursorPos - 2] : "";
                                                
                                                if (charBefore !== "{") {
                                                    // Replace the { with {{}}
                                                    const before = newValue.substring(0, cursorPos - 1); // Before the {
                                                    const after = newValue.substring(cursorPos); // After cursor
                                                    const completed = before + "{{}}" + after;
                                                    setTemplate(completed);
                                                    // Position cursor between {{ and }}: {{|}}
                                                    setTimeout(() => {
                                                        textarea.selectionStart = before.length + 2;
                                                        textarea.selectionEnd = before.length + 2;
                                                    }, 0);
                                                    return;
                                                }
                                            }
                                        }
                                        setTemplate(newValue);
                                    }}
                                    placeholder="e.g. You are an expert chef. Write a recipe for {{dish_name}}..."
                                />
                            </div>

                            <div className="mt-8 flex flex-col items-end gap-3">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-xs text-gray-400">
                                        Tip: Use <code className="bg-gray-100 px-1 rounded text-gray-700">{`{{field_name}}`}</code> to inject form data.
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsImproverOpen(true)}
                                            className="rounded-xl px-8 py-4 text-black font-graffiti text-lg transition-all shadow-lg bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl active:scale-95 flex items-center gap-2"
                                        >
                                            ✨ Improve Template
                                        </button>
                                        <button
                                            className={`rounded-xl px-10 py-4 text-black font-graffiti text-lg transition-all shadow-lg ${template === lastSavedTemplate
                                                ? "bg-gray-300 cursor-not-allowed shadow-none"
                                                : "bg-scaffold-brand hover:bg-scaffold-brandHover hover:shadow-xl active:scale-95"
                                                }`}
                                            onClick={saveTemplate}
                                            disabled={template === lastSavedTemplate}
                                        >
                                            {template === lastSavedTemplate ? "Saved" : "Save"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Template Improver Popup */}
            <TemplateImproverPopup
                isOpen={isImproverOpen}
                onClose={() => setIsImproverOpen(false)}
                currentTemplate={template}
                fieldList={taskFields.filter(f => f.field_type !== "runtime").map(f => f.field_name)}
            />
        </main>
    );
}
