"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BuilderDashboardUI from "../components/BuilderDashboardUI";

const FREE_TIER_LIMITS = {
  APPS_PER_ACCOUNT: 5,
  TASKS_PER_APP: 5,
};

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
    if (user) {
      refreshApps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      // Small delay to allow render
      setTimeout(() => window.dispatchEvent(new CustomEvent('scaffold-apps-loaded')), 100);
    }
  }

  async function createApp(name: string) {
    setStatus("");
    
    // Check if at limit
    if (apps.length >= FREE_TIER_LIMITS.APPS_PER_ACCOUNT) {
      setStatus(`❌ App limit reached: Maximum ${FREE_TIER_LIMITS.APPS_PER_ACCOUNT} apps per account`);
      return;
    }
    
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
    // Dispatch AFTER refresh so the new card is in the DOM
    setTimeout(() => window.dispatchEvent(new CustomEvent('scaffold-app-created')), 500);
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

  async function deleteApp(appId: string) {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setStatus("");
    const res = await authenticatedFetch(`/api/apps?id=${appId}`, { method: "DELETE" });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Delete app failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ App deleted");
    
    // Immediately remove from local state for instant UI update
    setApps(prevApps => prevApps.filter(app => app.id !== appId));
    
    // Then refresh to ensure sync with backend
    await refreshApps();
  }

  async function renameApp(appId: string, newName: string) {
    if (!newName.trim()) return;
    setStatus("");
    const res = await authenticatedFetch(`/api/apps/${appId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Rename app failed: ${data?.error || "unknown error"}`);
      return;
    }
    setStatus("✅ App renamed successfully");
    await refreshApps();
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
        onDeleteApp={deleteApp}
        onRenameApp={renameApp}
        appLimit={FREE_TIER_LIMITS.APPS_PER_ACCOUNT}
      />
    </>
  );
}

