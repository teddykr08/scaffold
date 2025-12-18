"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type FieldRow = {
  id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "textarea" | "select" | "number";
  required: boolean;
  order: number;
  options?: string[] | null;
  default_value?: string | null;
};

function EmbedFormInner() {
  const searchParams = useSearchParams();

  const appIdParam = searchParams.get("app_id");
  const taskNameParam = searchParams.get("task_name");

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
      const [gRes, tRes] = await Promise.all([
        fetch(`/api/global-fields?app_id=${encodeURIComponent(appId)}`),
        fetch(
          `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(
            taskName
          )}`
        ),
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

    const allFields = [...globalFields, ...taskFields];

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
          {globalFields.map(renderField)}
          {taskFields.map(renderField)}
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
          <div className="mt-6 rounded-xl border-2 border-green-500 bg-green-50 p-5">
            <div className="font-semibold text-green-900 mb-2">
              ✅ Your prompt is ready
            </div>

            <textarea
              readOnly
              value={generatedPrompt}
              className="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm"
              rows={8}
              onFocus={(e) => e.target.select()}
            />

            <div className="mt-3 flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 rounded-lg bg-black px-4 py-3 text-white hover:bg-gray-800"
              >
                {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
              </button>

              <a
                href={`https://chat.openai.com/?q=${encodeURIComponent(generatedPrompt)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-center hover:bg-gray-50"
              >
                Open in ChatGPT →
              </a>
            </div>

            <p className="mt-3 text-xs text-gray-600">
              Paste this into ChatGPT, Claude, Gemini, or any AI tool you prefer.
            </p>
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
