"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type FieldRow = {
  id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "textarea" | "select" | "number" | "runtime";
  required: boolean;
  order: number;
  options?: string[] | null;
  default_value?: string | null;
};

function EmbedFormInner() {
  const searchParams = useSearchParams();

  const appIdParam = searchParams.get("app_id");
  const taskNameParam = searchParams.get("task_name");
  const fixedContent = searchParams.get("fixed");

  const [globalFields, setGlobalFields] = useState<FieldRow[]>([]);
  const [taskFields, setTaskFields] = useState<FieldRow[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!appIdParam || !taskNameParam) return;

    const appId = appIdParam;
    const taskName = taskNameParam;

    async function fetchFields() {
      // First fetch task details to see if form is enabled
      const tDetailRes = await fetch(`/api/tasks/${encodeURIComponent(taskName)}?app_id=${encodeURIComponent(appId)}`);
      const tDetail = await tDetailRes.json();
      const taskHasForm = tDetail?.task?.has_form ?? true;

      if (!taskHasForm) {
        // If task is formless, auto-generate prompt immediately and skip fetching fields
        const res = await fetch("/api/generate-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app_id: appId,
            task_name: taskName,
            field_values: {},
            fixed_content: fixedContent || null,
          }),
        });

        const data = await res.json();
        if (data?.success) {
          setGeneratedPrompt(data.prompt);
          setStatus("✅ Prompt generated (formless task)");
        } else {
          setStatus(`❌ ${data?.error || "Unknown error"}`);
        }

        setGlobalFields([]);
        setTaskFields([]);
        return;
      }

      const [gRes, tRes] = await Promise.all([
        fetch(`/api/global-fields?app_id=${encodeURIComponent(appId)}`),
        fetch(`/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(taskName)}`),
      ]);

      const gData = await gRes.json();
      const tData = await tRes.json();

      const gFields: FieldRow[] = gData.success ? gData.fields || [] : [];
      const tFields: FieldRow[] = tData.success ? tData.fields || [] : [];

      setGlobalFields(gFields);
      setTaskFields(tFields);

      // Apply defaults
      const defaults: Record<string, string> = {};
      [...gFields, ...tFields].forEach((f) => {
        if (f.default_value) {
          defaults[f.field_name] = f.default_value;
        }
      });
      setValues(defaults);
    }

    fetchFields();
  }, [appIdParam, taskNameParam]);

  async function handleSubmit() {
    setStatus("");
    setGeneratedPrompt("");

    if (!appIdParam || !taskNameParam) {
      setStatus("❌ Missing app_id or task_name");
      return;
    }

    const appId = appIdParam;
    const taskName = taskNameParam;

    const allFields = [...globalFields, ...taskFields].filter(f => f.field_type !== "runtime");

    for (const field of allFields) {
      if (field.required) {
        const val = values[field.field_name];
        if (!val || val.trim() === "") {
          setStatus(`❌ Required field missing: ${field.field_label}`);
          return;
        }
      }
    }

    const res = await fetch("/api/generate-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: appId,
        task_name: taskName,
        field_values: values,
        fixed_content: fixedContent || null,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      setStatus(`❌ ${data.error || "Unknown error"}`);
      return;
    }

    if (data.success) {
      setGeneratedPrompt(data.prompt);
      setStatus("✅ Prompt generated! Copy it below.");
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderField(field: FieldRow) {
    const val = values[field.field_name] || "";

    const label = (
      <label className="text-sm text-gray-700">
        {field.field_label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );

    if (field.field_type === "textarea") {
      return (
        <div key={field.id}>
          {label}
          <textarea
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            rows={4}
            value={val}
            onChange={(e) =>
              setValues({ ...values, [field.field_name]: e.target.value })
            }
          />
        </div>
      );
    }

    if (field.field_type === "select") {
      return (
        <div key={field.id}>
          {label}
          <select
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={val}
            onChange={(e) =>
              setValues({ ...values, [field.field_name]: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.field_type === "number") {
      return (
        <div key={field.id}>
          {label}
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            value={val}
            onChange={(e) =>
              setValues({ ...values, [field.field_name]: e.target.value })
            }
          />
        </div>
      );
    }

    return (
      <div key={field.id}>
        {label}
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          value={val}
          onChange={(e) =>
            setValues({ ...values, [field.field_name]: e.target.value })
          }
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold">Scaffold Form</h1>

        <div className="mt-6 space-y-4">
          {globalFields.filter(f => f.field_type !== "runtime").map(renderField)}
          {taskFields.filter(f => f.field_type !== "runtime").map(renderField)}
        </div>

        <button
          className="mt-6 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
          onClick={handleSubmit}
        >
          Generate Prompt
        </button>

        {status && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            {status}
          </div>
        )}

        {generatedPrompt && (
          <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 shadow-2xl shadow-blue-100/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Prompt is Ready</h2>
            </div>

            <div className="relative group">
              <textarea
                readOnly
                value={generatedPrompt}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                rows={10}
              />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                  Editable if needed
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={copyToClipboard}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold transition-all shadow-lg ${copied
                    ? "bg-green-600 text-white shadow-green-200 scale-[0.98]"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]"
                  }`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ✓ Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>
                    Copy Prompt
                  </>
                )}
              </button>

              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(generatedPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                Open in ChatGPT
              </a>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
              <span className="h-px w-8 bg-gray-100"></span>
              Works with GPT-4, Claude 3, and Gemini
              <span className="h-px w-8 bg-gray-100"></span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function EmbedFormPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading form...</div>}>
      <EmbedFormInner />
    </Suspense>
  );
}
