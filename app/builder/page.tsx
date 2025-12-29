"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${session.access_token}`,
      };
    }
  }

  return fetch(url, fetchOptions);
}

export default function BuilderDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [newAppName, setNewAppName] = useState("");
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

  async function createApp() {
    setStatus("");
    if (!newAppName.trim()) {
      setStatus("❌ App name required");
      return;
    }

    const res = await authenticatedFetch("/api/apps", {
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
  }

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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your AI form projects</p>
        </div>

        {status && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
            {status}
          </div>
        )}

        {/* App Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {apps.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => router.push(`/builder/${app.id}`)}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{taskCounts[app.id] || 0} tasks</p>
              </div>
              <button
                className="mt-6 w-full rounded-lg bg-black text-white py-2.5 font-medium hover:bg-gray-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/builder/${app.id}`);
                }}
              >
                Open Project
              </button>
            </div>
          ))}

          {/* New Project Card */}
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
            <div className="text-4xl text-gray-400 mb-3">+</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Project</h3>
            <div className="w-full">
              <input
                type="text"
                placeholder="Project name"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createApp();
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-black"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  createApp();
                }}
                className="w-full rounded-lg bg-black text-white py-2 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
