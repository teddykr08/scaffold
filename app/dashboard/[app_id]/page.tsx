"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskWizard from "../../components/TaskWizard";

export default function AppPage({ params }: { params: { app_id: string } }){
  const { app_id } = params;
  const [tasks, setTasks] = useState<Array<any>>([]);
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(()=>{
    async function load(){
      const [aRes, tRes] = await Promise.all([
        fetch(`/api/apps`),
        fetch(`/api/tasks?app_id=${encodeURIComponent(app_id)}`),
      ]);
      const aData = await aRes.json();
      const tData = await tRes.json();
      const theApp = (aData.apps||[]).find((x:any)=>x.id===app_id);
      setApp(theApp);
      setTasks(tData.tasks || []);
      setLoading(false);
    }
    load();
  },[app_id]);

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button onClick={()=>router.push('/dashboard')} className="text-sm text-gray-600">← Back to Projects</button>
          <h1 className="text-2xl font-bold mt-2">{app?.name || 'Project'}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(t=> (
            <div key={t.id} className="border rounded-lg p-4 shadow-sm">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-gray-500 mt-1">Form: {t.has_form ? 'Yes' : 'No'}</div>
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/${app_id}/${t.name}`} className="px-3 py-1 bg-blue-600 text-white rounded">Open</Link>
                <button className="px-3 py-1 border rounded text-sm">Edit</button>
              </div>
            </div>
          ))}

          <div className="border rounded-lg p-4 flex items-center justify-center">
            <button onClick={() => setShowWizard(true)} className="px-3 py-2 border rounded">+ New Task</button>
          </div>
        </div>
      </div>
      {showWizard && (
        <TaskWizard
          appId={app_id}
          onClose={() => setShowWizard(false)}
          onCreate={async () => {
            setShowWizard(false);
            // refresh tasks after creation
            const tRes = await fetch(`/api/tasks?app_id=${encodeURIComponent(app_id)}`);
            const tData = await tRes.json();
            setTasks(tData.tasks || []);
          }}
        />
      )}
    </main>
  );
}
