"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import VariableTracker from "../../../components/VariableTracker";

export default function TaskEditor({ params }: { params: { app_id: string; task_name: string } }) {
  const { app_id, task_name } = params;
  const [task, setTask] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [template, setTemplate] = useState<string>("You are a helpful assistant.\n\n<<fixed>>");
  const [hasForm, setHasForm] = useState(true);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    async function load() {
      const [tRes, fRes] = await Promise.all([
        fetch(`/api/tasks/${encodeURIComponent(task_name)}?app_id=${encodeURIComponent(app_id)}`),
        fetch(`/api/task-fields?app_id=${encodeURIComponent(app_id)}&task_name=${encodeURIComponent(task_name)}`),
      ]);
      const tData = await tRes.json();
      const fData = await fRes.json();
      if (tData.success) {
        setTask(tData.task);
        setHasForm(tData.task?.has_form ?? true);
      }
      setFields(fData.fields || []);

      const pRes = await fetch(`/api/prompt-templates?app_id=${encodeURIComponent(app_id)}&task_name=${encodeURIComponent(task_name)}`);
      const pData = await pRes.json();
      if (pData.success && pData.templates && pData.templates.length) {
        setTemplate(pData.templates[0].template);
      }
    }
    load();
  }, [app_id, task_name]);

  function insertAtCursor(v: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const val = ta.value;
    const newVal = val.slice(0, start) + v + val.slice(end);
    setTemplate(newVal);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + v.length;
    }, 10);
  }

  async function saveTemplate() {
    await fetch("/api/prompt-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id, task_name, template }),
    });
    alert("Template saved");
  }

  async function moveField(id: string, dir: "up" | "down") {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const to = dir === "up" ? idx - 1 : idx + 1;
    if (to < 0 || to >= fields.length) return;
    const arr = [...fields];
    const a = arr[idx];
    arr[idx] = arr[to];
    arr[to] = a;
    const updates = arr.map((f, i) => ({ id: f.id, order: i + 1 }));
    const res = await fetch("/api/task-fields", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json();
    if (data.success) {
      setFields(arr.map((f, i) => ({ ...f, order: i + 1 })));
    }
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        <div className="col-span-3">
          <button onClick={() => router.push(`/dashboard/${app_id}`)} className="text-sm text-gray-600">
            ← Back to Projects
          </button>
          <h1 className="text-2xl font-bold mt-2">Task: {task_name}</h1>
        </div>

        <div className="col-span-2">
          <div className="rounded-lg border p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Task name</div>
                <div className="font-mono font-bold">{task_name}</div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasForm}
                    onChange={async (e) => {
                      setHasForm(e.target.checked);
                      await fetch("/api/tasks", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ app_id, name: task_name, has_form: e.target.checked }),
                      });
                    }}
                  />
                  <span>Enable Form</span>
                </label>
              </div>
            </div>
            {!hasForm && <div className="mt-3 text-sm text-gray-600">This task uses only &lt;&lt;fixed&gt;&gt; - no user form</div>}
          </div>

          {hasForm && (
            <div className="rounded-lg border p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Fields</div>
                <button className="px-2 py-1 border rounded text-sm">Add Field</button>
              </div>
              <div className="space-y-2">
                {fields.map((f) => (
                  <div key={f.id} className="flex items-center justify-between border p-2 rounded">
                    <div>
                      <div className="font-medium">{f.field_label}</div>
                      <div className="text-xs text-gray-500 font-mono">{`{{${f.field_name}}}`}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveField(f.id, "up")} className="px-2">
                        ↑
                      </button>
                      <button onClick={() => moveField(f.id, "down")} className="px-2">
                        ↓
                      </button>
                      <button className="px-2 text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Template Editor</div>
              <button onClick={saveTemplate} className="px-3 py-1 bg-black text-white rounded">
                Save Template
              </button>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <textarea
                  ref={textareaRef}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full h-64 font-mono p-2 border rounded"
                />
              </div>
              <div className="col-span-4">
                <VariableTracker template={template} fields={fields} onInsert={insertAtCursor} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="sticky top-6">
            <div className="rounded-lg border p-4">
              <div className="font-semibold mb-2">Preview</div>
              <div className="bg-gray-50 p-3 font-mono text-xs whitespace-pre-wrap">{template}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
