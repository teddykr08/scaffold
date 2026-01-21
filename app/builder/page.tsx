"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BuilderDashboardUI from "../components/BuilderDashboardUI";

const FREE_TIER_LIMITS = {
  APPS_PER_ACCOUNT: 3, // Free tier limit
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
  const [dataLoading, setDataLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    
    // Only fetch once, prevent duplicate calls
    if (user && !isFetchingRef.current) {
      console.log('[Dashboard] User found, fetching apps...');
      isFetchingRef.current = true;
      setDataLoading(true);
      refreshApps().finally(() => {
        console.log('[Dashboard] Apps fetch complete');
        setDataLoading(false);
        isFetchingRef.current = false;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function refreshApps() {
    console.log('[Dashboard] refreshApps called');
    const res = await authenticatedFetch("/api/apps", { method: "GET" });
    const data = await safeJson(res);
    console.log('[Dashboard] Apps data received:', data);
    if (data?.success) {
      // Immediately set apps for instant UI update
      console.log('[Dashboard] Setting', data.apps?.length, 'apps');
      setApps(data.apps || []);
      
      // Fetch task counts in parallel
      const counts: Record<string, number> = {};
      await Promise.all(
        (data.apps || []).map(async (app: AppRow) => {
          const tasksRes = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(app.id)}`);
          const tasksData = await safeJson(tasksRes);
          counts[app.id] = (tasksData?.tasks || []).length;
        })
      );
      setTaskCounts(counts);
      console.log('[Dashboard] Task counts set:', counts);
      window.dispatchEvent(new CustomEvent('scaffold-apps-loaded'));
    }
  }

  async function createApp(name: string) {
    setStatus("");
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }
    // Check if user has hit the limit
    if (apps.length >= FREE_TIER_LIMITS.APPS_PER_ACCOUNT) {
      setShowUpgradeModal(true);
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
    if (data.app) {
      setApps(prevApps => [...prevApps, data.app]);
      setTaskCounts(prev => ({ ...prev, [data.app.id]: 0 }));
    }
    await refreshApps();
    window.dispatchEvent(new CustomEvent('scaffold-app-created'));
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

  // Always show the dashboard if we have a user
  // Don't wait for data loading to complete

  async function deleteApp(appId: string) {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setStatus("");
    
    // Optimistic update - remove immediately
    setApps(prevApps => prevApps.filter(app => app.id !== appId));
    setTaskCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      delete newCounts[appId];
      return newCounts;
    });
    
    const res = await authenticatedFetch(`/api/apps?id=${appId}`, { method: "DELETE" });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Delete app failed: ${data?.error || "unknown error"}`);
      // Revert optimistic update on error
      await refreshApps();
      return;
    }
    setStatus("✅ App deleted");
  }

  async function renameApp(appId: string, newName: string) {
    if (!newName.trim()) return;
    setStatus("");
    
    // Optimistic update
    setApps(prevApps => 
      prevApps.map(app => 
        app.id === appId ? { ...app, name: newName.trim() } : app
      )
    );
    
    const res = await authenticatedFetch(`/api/apps/${appId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    });
    const data = await safeJson(res);
    if (!data?.success) {
      setStatus(`❌ Rename app failed: ${data?.error || "unknown error"}`);
      // Revert optimistic update
      await refreshApps();
      return;
    }
    setStatus("✅ App renamed successfully");
    await refreshApps();
  }

  return (
    <>
      {dataLoading && apps.length === 0 && (
        <div className="fixed top-24 right-6 z-[60] animate-pulse">
          <div className="px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 bg-blue-50 border-blue-100 text-blue-800">
            <span className="font-bold">Loading projects...</span>
          </div>
        </div>
      )}
      {status && (
        <div className="fixed top-24 right-6 z-[60] animate-in fade-in slide-in-from-right duration-300">
          <div className={`px-6 py-4 rounded-2xl border shadow-2xl flex items-center gap-3 ${status.includes('❌') ? 'bg-red-50 border-red-100 text-red-800' : 'bg-white border-gray-100 text-black'}`}>
            <span className="font-bold">{status}</span>
            <button onClick={() => setStatus('')} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">You&apos;ve Hit the Free Tier Limit</h2>
            <p className="text-gray-600 mb-4">
              Free accounts can create up to 3 apps and 5 tasks per app. You currently have {apps.length}.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900 mb-2">Want More?</p>
              <p className="text-sm text-blue-800">
                Scaffold Pro is coming soon with:
              </p>
              <ul className="text-sm text-blue-800 list-disc pl-5 mt-2 space-y-1">
                <li>Unlimited apps and tasks</li>
                <li>Analytics and A/B testing</li>
                <li>Custom domains</li>
                <li>Priority support</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Pro tier coming soon! We\'ll notify you when it launches.');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                Join Waitlist
              </button>
            </div>
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

