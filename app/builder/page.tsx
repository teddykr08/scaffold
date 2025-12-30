"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BuilderDashboardUI from "../components/BuilderDashboardUI";

type AppRow = {
  id: string;
  name: string;
  system_header: string;
  created_at: string;
};

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
      if (!fetchOptions.headers) fetchOptions.headers = {};
      (fetchOptions.headers as any)["Authorization"] = `Bearer ${session.access_token}`;
    }
  }

  return fetch(url, fetchOptions);
}

export default function BuilderDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [status, setStatus] = useState<string>("");
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    refreshApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshApps() {
    const res = await authenticatedFetch("/api/apps", { method: "GET" });
    const data = await safeJson(res);
    if (data?.success) {
      setApps(data.apps || []);
      const counts: Record<string, number> = {};
      for (const app of data.apps || []) {
        const tasksRes = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(app.id)}`);
        const tasksData = await safeJson(tasksRes);
        counts[app.id] = (tasksData?.tasks || []).length;
      }
      setTaskCounts(counts);
    }
  }

  async function createApp(name: string) {
    setStatus("");
    const res = await authenticatedFetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Create app failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ App created");
    await refreshApps();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {status && (
        <div className="fixed top-24 right-6 z-[60] animate-in fade-in slide-in-from-right duration-300">
          <div className={`px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 ${status.includes('❌') ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-gray-100 text-black'}`}>
            <span className="font-bold">{status}</span>
            <button onClick={() => setStatus('')} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        </div>
      )}
      <BuilderDashboardUI
        apps={apps.map(app => ({
          ...app,
          task_count: taskCounts[app.id] || 0
        }))}
        onAppClick={(id) => router.push(`/builder/${id}`)}
        onCreateApp={createApp}
      />
    </>
  );
}

