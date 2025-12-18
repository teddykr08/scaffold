"use client";

import { useState } from "react";

export default function EmbedExample() {
  const [appId, setAppId] = useState("f02d65f6-64c2-4834-b0b3-14f6fc4f7522");
  const [taskName, setTaskName] = useState("write_email");

  const embedUrl = `/embed/form?app_id=${appId}&task_name=${taskName}`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Try It</h2>

      <div className="space-y-2">
        <label className="font-semibold">App ID</label>
        <input
          className="border p-2 w-full"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
        />

        <label className="font-semibold">Task Name</label>
        <input
          className="border p-2 w-full"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />
      </div>

      <div className="border rounded p-3 bg-gray-50 text-sm">
        <pre>{`<iframe 
  src="https://YOUR_URL/embed/form?app_id=${appId}&task_name=${taskName}"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`}</pre>
      </div>

      <a
        className="bg-blue-600 text-white px-4 py-2 rounded"
        href={embedUrl}
        target="_blank"
      >
        Open Form
      </a>

      <h3 className="text-xl font-bold">Live Preview</h3>

      <iframe
        src={embedUrl}
        width="100%"
        height="500"
        frameBorder="0"
        className="border rounded"
      />
    </div>
  );
}
