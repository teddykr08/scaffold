"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage(){
  const [apps, setApps] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      const res = await fetch('/api/apps');
      const data = await res.json();
      if(data?.success){
        const apps = data.apps || [];
        // fetch task counts for each app
        const withCounts = await Promise.all(apps.map(async (a:any)=>{
          const r = await fetch(`/api/tasks?app_id=${encodeURIComponent(a.id)}`);
          const d = await r.json();
          return { ...a, task_count: d?.tasks?.length || 0 };
        }));
        setApps(withCounts);
      }
      setLoading(false);
    }
    load();
  },[]);

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Link href="/builder" className="text-sm text-gray-500">Open Builder (legacy)</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(a=> (
            <div key={a.id} className="border rounded-lg p-4 shadow-sm">
              <div className="font-semibold">{a.name}</div>
              <div className="text-xs text-gray-500 mt-1">{a.task_count} tasks</div>
              <div className="mt-4">
                <Link href={`/dashboard/${a.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">Open</Link>
              </div>
            </div>
          ))}

          <div className="border rounded-lg p-4 flex items-center justify-center">
            <Link href="/dashboard/new" className="px-3 py-2 border rounded">+ New Project</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
