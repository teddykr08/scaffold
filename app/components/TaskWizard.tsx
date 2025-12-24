"use client";

import React, { useState } from "react";

// Very small, self-contained wizard for creating a task
export default function TaskWizard({ appId, onClose, onCreate }:{appId:string, onClose:()=>void, onCreate:()=>void}){
  const [step, setStep] = useState(1);
  const [taskName, setTaskName] = useState("");
  const [hasForm, setHasForm] = useState(true);
  const [fields, setFields] = useState<Array<any>>([]);
  const [template, setTemplate] = useState("You are a helpful assistant.\n\n<<fixed>>");

  function addField(f:any){
    setFields(prev=>[...prev,{...f,id:Date.now().toString()}]);
  }

  async function createTask(){
    // call API to create task
    await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:appId,name:taskName,has_form: hasForm})});
    // create fields
    for(const f of fields){
      await fetch('/api/task-fields',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:appId,task_name:taskName,field_name:f.field_name,field_label:f.field_label,field_type:f.field_type,required:f.required,order:f.order||0})});
    }
    // save template
    await fetch('/api/prompt-templates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({app_id:appId,task_name:taskName,template})});

    onCreate();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold">Create Task — Step {step}/4</div>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>

        {step===1 && (
          <div>
            <label className="block text-sm font-medium">Task name</label>
            <input value={taskName} onChange={e=>setTaskName(e.target.value)} className="w-full mt-1 border px-2 py-1" />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={hasForm} onChange={e=>setHasForm(e.target.checked)} />
                <span className="ml-2">Enable form for user input</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setStep(2)} className="px-4 py-2 bg-black text-white rounded">Next</button>
            </div>
          </div>
        )}

        {step===2 && (
          <div>
            <div className="text-sm font-medium mb-2">Fields</div>
            {hasForm ? (
              <div>
                <div className="mb-2">
                  <input placeholder="Field label" id="f_label" className="border px-2 py-1 mr-2" />
                </div>
                <div className="flex justify-between mt-4">
                  <button onClick={()=>setStep(1)} className="px-3 py-1 border rounded">Back</button>
                  <button onClick={()=>setStep(3)} className="px-3 py-1 bg-black text-white rounded">Next</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">Form disabled; skipping fields.</p>
                <div className="mt-4 flex justify-between">
                  <button onClick={()=>setStep(1)} className="px-3 py-1 border rounded">Back</button>
                  <button onClick={()=>setStep(3)} className="px-3 py-1 bg-black text-white rounded">Next</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step===3 && (
          <div>
            <label className="text-sm font-medium">Template</label>
            <textarea value={template} onChange={e=>setTemplate(e.target.value)} className="w-full mt-1 border p-2 h-40 font-mono" />
            <div className="mt-4 flex justify-between">
              <button onClick={()=>setStep(2)} className="px-3 py-1 border rounded">Back</button>
              <button onClick={()=>setStep(4)} className="px-3 py-1 bg-black text-white rounded">Next</button>
            </div>
          </div>
        )}

        {step===4 && (
          <div>
            <div className="text-sm mb-2">Preview & Create</div>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono break-all">https://scaffoldtool.vercel.app/embed/form?app_id={appId}&task_name={taskName}&fixed=example</div>
            <p className="text-xs text-gray-500 mt-2">Add &fixed=your_text to the URL to set dynamic context</p>
            <div className="mt-4 flex justify-between">
              <button onClick={()=>setStep(3)} className="px-3 py-1 border rounded">Back</button>
              <button onClick={createTask} className="px-3 py-1 bg-green-600 text-white rounded">Create Task</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
