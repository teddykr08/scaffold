"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type FieldRow = {
  id: string;
  field_name: string;
  field_label: string;
  field_type: "text" | "textarea" | "select" | "number" | "runtime" | "media";
  required: boolean;
  order: number;
  options?: string[] | string | null;
  default_value?: string | null;
  min?: number | null;
  max?: number | null;
};

function EmbedFormInner() {
  const searchParams = useSearchParams();

  const getParam = (name: string) => {
    try {
      const fromHook = (searchParams as any)?.get?.(name);
      if (fromHook) return fromHook;
    } catch (e) {
      /* ignore */
    }
    try {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        return sp.get(name);
      }
    } catch (e) {
      /* ignore */
    }
    try {
      // If loaded inside an iframe, the host's iframe `src` may contain the params
      if (typeof window !== 'undefined' && (window as any).frameElement) {
        try {
          const fe = window.frameElement as HTMLIFrameElement;
          if (fe && fe.src) {
            const u = new URL(fe.src, window.location.origin);
            return u.searchParams.get(name);
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  };

  const [appIdParam, setAppIdParam] = useState<string | null>(null);
  const [taskNameParam, setTaskNameParam] = useState<string | null>(null);
  const iframeIdRef = useRef<string>(`scaffold-iframe-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
  const fixedContentFromUrl = searchParams.get("fixed");
  const colorFromUrl = searchParams.get("color");
  const fontFromUrl = searchParams.get("font");
  const fieldListFromUrl = searchParams.get("field_list");

  const [fields, setFields] = useState<FieldRow[]>([]);
  const [task, setTask] = useState<{ has_form: boolean } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const promptRef = useRef<HTMLDivElement>(null);

  // Internal handshake state
  const [lastOutgoing, setLastOutgoing] = useState<any>(null);
  const [lastParentAck, setLastParentAck] = useState<any>(null);
  const shouldAutoScrollRef = useRef(false);

  // Ensure params are available after hydration / when embedded
  useEffect(() => {
    try {
      const a = getParam("app_id");
      const t = getParam("task_name");
      if (a) setAppIdParam(a);
      if (t) setTaskNameParam(t);
    } catch (e) {
      // ignore
    }
  }, [searchParams]);

  // Extracted scroll helper so other effects can call it
  const doScroll = () => {
    try {
      try {
        if (promptRef.current && typeof promptRef.current.focus === 'function') {
          promptRef.current.focus({ preventScroll: false });
        }
      } catch (e) { /* ignore */ }

      if (promptRef.current) {
        // Try immediate placement
        try { promptRef.current.scrollIntoView({ behavior: 'auto', block: 'end' }); } catch (e) {}

        // Compute a precise scroll so the bottom of the prompt sits inside the viewport
        try {
          const el = promptRef.current as HTMLElement;
          const rect = el.getBoundingClientRect();
          const elHeight = rect.height || el.offsetHeight || el.clientHeight || 0;
          const padding = 80; // increased breathing room so buttons aren't flush to edge
          const desired = (window.scrollY || window.pageYOffset) + rect.top - (window.innerHeight - elHeight) + padding;
          if (!isNaN(desired) && isFinite(desired)) {
            try { window.scrollTo({ top: Math.max(0, desired), behavior: 'smooth' }); } catch (e) { /* ignore */ }
          }

          // Follow-up nudge after animation in case layout shifts (e.g. images, fonts)
          setTimeout(() => {
            try {
              const r2 = el.getBoundingClientRect();
              const elBottom2 = (window.scrollY || window.pageYOffset) + r2.bottom;
              const viewportBottom2 = (window.scrollY || window.pageYOffset) + window.innerHeight;
              if (elBottom2 > viewportBottom2 - padding) {
                const top2 = elBottom2 - window.innerHeight + padding;
                try { window.scrollTo({ top: Math.max(0, top2), behavior: 'smooth' }); } catch (e) { /* ignore */ }
              }
            } catch (e) { /* ignore */ }
            try { window.scrollBy({ top: 40, behavior: 'smooth' }); } catch (e) { /* ignore */ }
          }, 450);
        } catch (e) { /* ignore */ }
      }

      try {
        if (window.top && window.top !== window) {
          try {
            const rect = promptRef.current?.getBoundingClientRect();
            const desired = (rect ? rect.top + window.frameElement.getBoundingClientRect().top : 0) + 20;
            window.top.scrollTo({ top: desired, behavior: 'smooth' });
          } catch (e) {
            try { window.top.scrollBy({ top: 200, behavior: 'smooth' }); } catch (e2) { /* ignore */ }
          }
        }
      } catch (e) { /* ignore */ }

      try {
        const payload = { type: 'scaffold:scrollToPrompt', stamp: Date.now(), app_id: appIdParam, task_name: taskNameParam, src: window.location.href, iframe_id: iframeIdRef.current };
        setLastOutgoing(payload);
        window.parent.postMessage(payload, '*');
      } catch (e) { /* ignore */ }

      try {
        const ta = promptRef.current?.querySelector('textarea');
        if (ta && typeof (ta as HTMLTextAreaElement).focus === 'function') {
          (ta as HTMLTextAreaElement).focus({ preventScroll: false });
        }
      } catch (e) { /* ignore */ }

      try {
        const prevHash = window.location.hash;
        window.location.hash = '#scaffold-generated-prompt';
        setTimeout(() => {
          try { if (history && history.replaceState) history.replaceState(null, document.title, window.location.pathname + window.location.search + (prevHash || '')); } catch (e) { /* ignore */ }
        }, 500);
      } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('[EmbedForm] robust scroll error', e);
    }
  };

  // Scroll to generated prompt after it appears (runs after render)
  // NOTE: autoscroll only happens when user clicks Generate; handleSubmit triggers the scroll/handshake.

  // Customization state - initialize from URL params
  const [customColor, setCustomColor] = useState(colorFromUrl || "#000000");
  const [fontFamily, setFontFamily] = useState(fontFromUrl || "Inter");

  // Listen for parent acknowledgement messages (helps debugging when embedded)
  useEffect(() => {
    function onParentMsg(e: MessageEvent) {
      try {
        const d = (e.data as any) || {};
        if (d?.type === 'scaffold:scrolledToPrompt' && d?.iframe_id === iframeIdRef.current) {
          setLastParentAck(d);
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('message', onParentMsg);
    return () => window.removeEventListener('message', onParentMsg);
  }, []);

  // Persistent handshake: keep asking parent to scroll until ack (or timeout)
  const handshakeRef = useRef<{ timer?: number | null; attempts: number }>({ timer: null, attempts: 0 });
  const startScrollHandshake = () => {
    try {
      if (!window.parent) return;
      handshakeRef.current.attempts = 0;
      if (handshakeRef.current.timer) {
        clearInterval(handshakeRef.current.timer as number);
        handshakeRef.current.timer = null;
      }
      const maxAttempts = 6; // a few attempts (~1.8s) then stop
      const interval = 300;
      handshakeRef.current.timer = window.setInterval(() => {
        try {
          handshakeRef.current.attempts++;
          const payload = { type: 'scaffold:scrollToPrompt', stamp: Date.now(), app_id: appIdParam, task_name: taskNameParam, src: window.location.href, iframe_id: iframeIdRef.current };
          setLastOutgoing(payload);
          window.parent.postMessage(payload, '*');
          if (handshakeRef.current.attempts >= maxAttempts) {
            if (handshakeRef.current.timer) {
              clearInterval(handshakeRef.current.timer as number);
              handshakeRef.current.timer = null;
            }
          }
        } catch (e) { /* ignore */ }
      }, interval);
    } catch (e) {
      // ignore
    }
  };

  // Stop handshake when parent ack received (matching iframe_id)
  useEffect(() => {
    if (!lastParentAck) return;
    try {
      if (handshakeRef.current.timer) {
        clearInterval(handshakeRef.current.timer as number);
        handshakeRef.current.timer = null;
      }
    } catch (e) { /* ignore */ }
  }, [lastParentAck]);

  // Run autoscroll once after the generated prompt is rendered, but only when
  // `shouldAutoScrollRef` was set (user clicked Generate).
  useEffect(() => {
    if (!generatedPrompt) return;
    if (!shouldAutoScrollRef.current) return;
    shouldAutoScrollRef.current = false;
    try {
      requestAnimationFrame(() => {
        try { doScroll(); } catch (e) { /* ignore */ }
      });
    } catch (e) { /* ignore */ }
  }, [generatedPrompt]);

  // Debug overlay state is declared above to ensure effects can reference it

  useEffect(() => {
    if (!appIdParam || !taskNameParam) return;

    const appId = appIdParam;
    const taskName = taskNameParam;

    async function fetchData() {
      // 1. Fetch Task Info
      const taskRes = await fetch(`/api/tasks/get?app_id=${encodeURIComponent(appId)}&name=${encodeURIComponent(taskName)}&t=${Date.now()}`, { cache: "no-store" });
      const taskData = await taskRes.json();
      if (taskData.success) {
        setTask(taskData.task);
        // URL params take priority over database values
        // Only set customization from task data if NOT provided via URL params
        if (!colorFromUrl && taskData.task) {
          const color = taskData.task.custom_color || taskData.task.customColor || "#000000";
          setCustomColor(color);
        } else if (colorFromUrl) {
          setCustomColor(colorFromUrl);
        }
        if (!fontFromUrl && taskData.task) {
          const font = taskData.task.font || taskData.task.font_family || "Inter";
          setFontFamily(font);
        } else if (fontFromUrl) {
          setFontFamily(fontFromUrl);
        }
      }

      // 2. Fetch Task Fields
      const tRes = await fetch(
        `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(
          taskName
        )}&t=${Date.now()}`,
        { cache: "no-store" }
      );
      const tData = await tRes.json();
      const tFields: FieldRow[] = tData.success ? tData.fields || [] : [];

      setFields(tFields.sort((a, b) => a.order - b.order));

      // Apply defaults
      const defaults: Record<string, string> = {};
      tFields.forEach((f) => {
        if (f.default_value) {
          defaults[f.field_name] = f.default_value;
        }
      });

      // Merge defaults into values state
      setValues((prev) => ({ ...prev, ...defaults }));

      // No auto-scroll during initial load; wait for explicit user action (Generate)
    }

    fetchData();
  }, [appIdParam, taskNameParam, colorFromUrl, fontFromUrl, fieldListFromUrl]);

  // NOTE: do not auto-generate prompts on load. Generation must be explicit via the 'Generate Prompt' button.

  async function handleSubmit() {
    setStatus("");
    setGeneratedPrompt("");

    if (!appIdParam || !taskNameParam) {
      setStatus("❌ Missing app_id or task_name");
      return;
    }

    const appId = appIdParam;
    const taskName = taskNameParam;

    // Only check visible fields that aren't hidden by URL params
    const allVisibleFields = fields.filter(f => 
      f.field_type !== "runtime" &&
      f.field_name !== "field_list" && // Skip validation for URL-provided fields
      f.field_name !== "purpose" &&
      f.field_name !== "requirements"
    );

    for (const field of allVisibleFields) {
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
        fixed_content: fixedContentFromUrl || null,
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
      try {
          const payload = { type: 'scaffold:scrollToPrompt', stamp: Date.now(), app_id: appIdParam, task_name: taskNameParam, src: window.location.href, iframe_id: iframeIdRef.current };
          // (silent in production) store last outgoing payload
          setLastOutgoing(payload);
          window.parent.postMessage(payload, '*');
          // mark to auto-scroll once the prompt is rendered
          shouldAutoScrollRef.current = true;
          // start persistent handshake until parent acks
          startScrollHandshake();
      } catch (e) { /* ignore */ }
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function renderField(field: FieldRow) {
    // Skip media fields from being rendered as input fields
    if (field.field_type === "media") {
      return null;
    }

    const val = values[field.field_name] || "";

    const label = (
      <label className="text-sm text-gray-700">
        {field.field_label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );

    if (field.field_type === "textarea") {
      return (
        <div key={field.id} className="relative z-10">
          {label}
          <textarea
            className="field-input mt-1 w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2"
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
        <div key={field.id} className="relative z-10">
          {label}
          <select
            className="field-input mt-1 w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2"
            value={val}
            onChange={(e) =>
              setValues({ ...values, [field.field_name]: e.target.value })
            }
          >
            <option value="">-- Select --</option>
            {(Array.isArray(field.options) ? field.options : typeof field.options === 'string' && field.options ? [field.options] : []).map((opt) => (
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
        <div key={field.id} className="relative z-10">
          {label}
          <input
            type="number"
            className="field-input mt-1 w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2"
            value={val}
            min={typeof field.min === 'number' ? field.min : undefined}
            max={typeof field.max === 'number' ? field.max : undefined}
            onChange={(e) =>
              setValues({ ...values, [field.field_name]: e.target.value })
            }
          />
        </div>
      );
    }

    return (
      <div key={field.id} className="relative z-10">
        {label}
        <input
          type="text"
          className="field-input mt-1 w-full rounded-lg border px-3 py-2 transition-all focus:outline-none focus:ring-2"
          value={val}
          onChange={(e) =>
            setValues({ ...values, [field.field_name]: e.target.value })
          }
        />
      </div>
    );
  }

  function renderMediaField(field: FieldRow) {
    if (field.field_type !== "media" || !field.options) return null;
    // Support both string and string[] for options
    const opt = Array.isArray(field.options) ? field.options[0] : field.options;
    if (!opt) return null;

    if (opt.startsWith("image:")) {
      const imageUrl = opt.substring(6);
      if (!imageUrl) return null;
      return (
        <div key={field.id} className="relative z-10 mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">{field.field_label}</div>
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={field.field_label}
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class='p-4 text-sm text-red-600'>Failed to load image</div>`;
              }}
            />
          </div>
        </div>
      );
    }

    if (opt.startsWith("text:")) {
      const textContent = opt.substring(5);
      if (!textContent) return null;
      return (
        <div key={field.id} className="relative z-10 mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">{field.field_label}</div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {textContent}
          </div>
        </div>
      );
    }
    return null;
  }

  // --- Dynamic Styling Logic ---
  // Force default theme for simpler, Google-forms-like appearance
  const theme = "default";

  // Helper to get font URL
  const getGoogleFontUrl = (font: string) => {
    return `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@300;400;600;700&display=swap`;
  };

  // Convert hex to variants for some themes
  // (Simplified for now, just using the color directly or basic opacities)

  return (
    <main className={`min-h-screen p-4 md:p-8 theme-${theme}`} style={{
      fontFamily: `"${fontFamily}", sans-serif`,
      // @ts-ignore
      "--brand-color": customColor,
    } as React.CSSProperties}>
      <style jsx global>{`
        @import url('${getGoogleFontUrl(fontFamily)}');
        
        :root {
           --brand-color: ${customColor};
        }

        /* 
           SHARED RESETS 
           Every theme uses shades of black/white/gray + ONE accent color 
        */

        /* === 1. DEFAULT (Google Form Style) === */
        /* Light gray BG, White Card with Top Accent Bar */
        .theme-default {
            background-color: #f0f2f5;
            color: #202124;
        }
        .theme-default .card-container {
            background: white;
            border-radius: 8px;
            border: 1px solid #dadce0;
            /* The one big accent: Top Border */
            border-top: 10px solid var(--brand-color); 
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
        }
        .theme-default label {
            font-weight: 500;
            color: #202124;
            margin-bottom: 4px;
            display: block;
        }
        .theme-default .field-input {
            background: #fff;
            border: 1px solid #dadce0;
            border-radius: 4px;
            color: #3c4043;
        }
        .theme-default .field-input:focus {
            outline: none;
            border-bottom: 2px solid var(--brand-color);
            border-radius: 4px 4px 2px 2px;
            /* Google forms often just underline interaction on focus, 
               but we keep the box shape for consistency with other inputs */
             border-color: var(--brand-color);
        }
        .theme-default .btn-generate {
            background-color: var(--brand-color);
            color: white; /* We assume accent is dark enough, or user picks right color */
            border-radius: 4px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }

        /* Additional themes removed — only default theme is active. */
        
      `}</style>

      <div className="mx-auto max-w-2xl">
        <div className="card-container p-6 md:p-10 space-y-6">

          {/* Render media fields first */}
          {fields
            .filter((f) => f.field_type === "media")
            .map((field) => renderMediaField(field))}

          {/* Then render input fields */}
          {fields
            .filter((f) => 
              f.field_type !== "runtime" && 
              f.field_type !== "media" &&
              !f.field_label.toLowerCase().includes("additional instructions") && 
              f.field_name !== "additional_instructions" &&
              f.field_name !== "field_list" && // Hide field_list since it comes from URL
              f.field_name !== "purpose" && // Hide purpose field
              f.field_name !== "requirements" // Hide requirements field
            )
            .map((field) => renderField(field))}
        </div>

        {/* Only show Generate button for tasks with forms */}
        {task?.has_form !== false && (
          <button
            className="btn-generate mt-8 w-full rounded-xl px-6 py-4 text-sm font-bold transition-all active:scale-[0.98] shadow-lg"
            onClick={handleSubmit}
          >
            {status === "generating" ? "Generating..." : "Generate Prompt"}
          </button>
        )}

        {status && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            {status}
          </div>
        )}

        {generatedPrompt && (
          <div id="scaffold-generated-prompt" ref={promptRef} tabIndex={-1} className="mt-8 rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ border: '1px solid #e6e6e9', borderTop: '6px solid var(--brand-color)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: 'var(--brand-color)' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Your Prompt is Ready
              </h2>
            </div>

            <div className="relative group">
              <textarea
                readOnly
                value={generatedPrompt}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 font-mono text-sm text-gray-700 focus:outline-none transition-all resize-none"
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
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold transition-all shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: 'var(--brand-color)', color: '#ffffff', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
              >
                {copied ? (
                  <>
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
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ✓ Copied!
                  </>
                ) : (
                  <>
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
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>

              <a
                href={`https://chatgpt.com/?q=${encodeURIComponent(
                  generatedPrompt
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white px-6 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] shadow-sm"
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
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
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

      {/* debug overlay removed for production */}

      {/* Powered by scaffold footer */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://scaffoldtool.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
        >
          <span>powered by</span>
          <span className="font-graffiti text-sm text-black">scaffold</span>
        </a>
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
