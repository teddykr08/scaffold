"use client";

import React from "react";
import Link from "next/link";
import TaskWizard from "@/app/components/TaskWizard";

export default function DemoDashboard(){
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Projects — Demo Preview</h1>
          <div className="text-sm text-gray-500">Preview mode — no sign-up required</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 shadow-sm">
            <div className="font-semibold">Local Search Demo</div>
            <div className="text-xs text-gray-500 mt-1">3 tasks</div>
            <div className="mt-4">
              <Link href="#" className="px-3 py-1 bg-blue-600 text-white rounded">Open</Link>
            </div>
          </div>

          <div className="border rounded-lg p-4 shadow-sm">
            <div className="font-semibold">Email Assistant</div>
            <div className="text-xs text-gray-500 mt-1">2 tasks</div>
            <div className="mt-4">
              <Link href="#" className="px-3 py-1 bg-blue-600 text-white rounded">Open</Link>
            </div>
          </div>

          <div className="border rounded-lg p-4 flex items-center justify-center">
            <button className="px-3 py-2 border rounded">+ New Project</button>
          </div>
        </div>

        <div className="mt-8">
          <div className="rounded-xl border p-4">
            <div className="font-semibold mb-2">What this demo shows</div>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>- Project list with task counts</li>
              <li>- Task cards and basic editor UI</li>
              <li>- Task creation wizard (opens below)</li>
            </ul>
          </div>
        </div>

      </div>
    </main>
  );
}
