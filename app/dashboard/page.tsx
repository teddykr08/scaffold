"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage(){
  const [apps, setApps] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

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
            {!showNewProject ? (
              <button onClick={() => setShowNewProject(true)} className="px-3 py-2 border rounded">+ New Project</button>
            ) : (
              <div className="w-full">
                <input value={newProjectName} onChange={(e)=>setNewProjectName(e.target.value)} className="w-full mb-2 p-2 border rounded" placeholder="Project name" />
                <div className="flex gap-2 justify-end">
                  <button onClick={()=>{setShowNewProject(false); setNewProjectName("");}} className="px-3 py-1 border rounded">Cancel</button>
                  <button onClick={async ()=>{
                    if(!newProjectName.trim()) return;
                    const res = await fetch('/api/apps',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newProjectName.trim()})});
                    const data = await res.json();
                    if(data.success){
                      // refresh
                      const r = await fetch('/api/apps');
                      const d = await r.json();
                      setApps(d.apps || []);
                    }
                    setShowNewProject(false); setNewProjectName("");
                  }} className="px-3 py-1 bg-green-600 text-white rounded">Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
