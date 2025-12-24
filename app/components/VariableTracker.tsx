"use client";

import React from "react";

type FieldRow = {
  id: string;
  field_name: string;
  field_label: string;
};

export default function VariableTracker({
  template,
  fields,
  onInsert,
}: {
  template: string;
  fields: FieldRow[];
  onInsert: (v: string) => void;
}) {
  const vars = ["<<fixed>>", ...fields.map(f => `{{${f.field_name}}}`)];

  return (
    <div className="space-y-2">
      {vars.map(v => {
        const exists = template.includes(v);
        return (
          <button
            key={v}
            onClick={() => onInsert(v)}
            className={`w-full flex items-center justify-between px-2 py-1 rounded ${exists ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}
          >
            <div className="text-xs font-mono">{v}</div>
            <div className={`text-xs ${exists ? 'text-green-600' : 'text-gray-400'}`}>{exists ? '✓' : '○'}</div>
          </button>
        );
      })}
    </div>
  );
}
