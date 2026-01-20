"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ActionMenu from "../../components/ActionMenu";
import RenameModal from "../../components/RenameModal";

const FREE_TIER_LIMITS = {
    APPS_PER_ACCOUNT: 3,
    TASKS_PER_APP: 3,
};

type AppRow = {
    id: string;
    name: string;
    system_header: string;
    created_at: string;
};

type TaskRow = {
    id: string;
    name: string;
    description: string | null;
    system_header?: string | null;
    fixed_content?: string | null;
    created_at: string;
};

type FieldRow = {
    id: string;
    app_id: string;
    task_name?: string;
    field_name: string;
    field_label: string;
    field_type: string;
    required: boolean;
    order: number;
    options?: string[] | null;
    default_value?: string | null;
    created_at: string;
};

function slugifyFieldName(s: string) {
    return s
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_ ]/g, "")
        .replace(/\s+/g, "_")
        .slice(0, 48);
}

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

export default function AppDetailPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const appId = params?.app_id as string;

    const [app, setApp] = useState<AppRow | null>(null);
    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const [newTaskName, setNewTaskName] = useState("");
    const [status, setStatus] = useState<string>("");
    const [fieldCounts, setFieldCounts] = useState<Record<string, number>>({});
    const [dataLoading, setDataLoading] = useState(true);
    const isFetchingRef = useRef(false);

    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    
    // Rename modal state
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [renameTaskId, setRenameTaskId] = useState<string>("");
    const [renameTaskName, setRenameTaskName] = useState<string>("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        
        // Prevent duplicate fetches
        if (user && appId && !isFetchingRef.current) {
            console.log('[ProjectPage] User and appId found, fetching data...');
            isFetchingRef.current = true;
            setDataLoading(true);
            Promise.all([refreshApp(), refreshTasks()]).finally(() => {
                console.log('[ProjectPage] Data fetch complete');
                setDataLoading(false);
                isFetchingRef.current = false;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, appId]);

    async function refreshApp() {
        const res = await authenticatedFetch("/api/apps", { method: "GET" });
        const data = await safeJson(res);
        if (data?.success) {
            const foundApp = (data.apps || []).find((a: AppRow) => a.id === appId);
            setApp(foundApp || null);
        }
    }

    async function refreshTasks() {
        if (!appId) return;
        console.log('[ProjectPage] refreshTasks called for appId:', appId);
        const res = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(appId)}`);
        const data = await safeJson(res);
        console.log('[ProjectPage] Tasks data received:', data);
        if (data?.success) {
            // Immediately set tasks for instant UI update
            console.log('[ProjectPage] Setting', data.tasks?.length, 'tasks');
            setTasks(data.tasks || []);

            // Fetch field counts in parallel
            const counts: Record<string, number> = {};
            await Promise.all(
                (data.tasks || []).map(async (task: TaskRow) => {
                    const fieldsRes = await fetch(
                        `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(task.name)}`
                    );
                    const fieldsData = await safeJson(fieldsRes);
                    counts[task.name] = ((fieldsData?.fields || []).filter((f: FieldRow) => f.field_type !== "runtime")).length;
                })
            );
            setFieldCounts(counts);
            console.log('[ProjectPage] Field counts set:', counts);
            window.dispatchEvent(new CustomEvent('scaffold-tasks-loaded'));
        }
    }

    async function createTask() {
        setStatus("");
        const name = newTaskName.trim();
        if (!name) {
            setStatus("❌ Task name required");
            return;
        }

        // Check if at limit
        if (tasks.length >= FREE_TIER_LIMITS.TASKS_PER_APP) {
            setStatus(`❌ Task limit reached: Maximum ${FREE_TIER_LIMITS.TASKS_PER_APP} tasks per app`);
            return;
        }

        try {
            const slugified = slugifyFieldName(name);
            
            // Optimistic update - add immediately
            const tempTask: TaskRow = {
                id: 'temp-' + Date.now(),
                name: slugified,
                description: null,
                created_at: new Date().toISOString()
            };
            setTasks(prevTasks => [...prevTasks, tempTask]);
            setFieldCounts(prev => ({ ...prev, [slugified]: 0 }));
            setNewTaskName("");
            setShowNewTaskModal(false);
            
            const res = await authenticatedFetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    app_id: appId,
                    name: slugified,
                }),
            });
            const data = await safeJson(res);
            if (!data?.success) {
                setStatus(`❌ Create task failed: ${data?.error || "unknown error"}`);
                // Revert optimistic update
                setTasks(prevTasks => prevTasks.filter(t => t.id !== tempTask.id));
                return;
            }
            setStatus("✅ Task created");
            window.dispatchEvent(new CustomEvent('scaffold-task-created'));
            // Refresh to get the real data
            await refreshTasks();
        } catch (error) {
            console.error('Error creating task:', error);
            setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async function renameTask(taskId: string, newName: string) {
        if (!newName.trim()) return;
        setStatus("");
        const slugified = slugifyFieldName(newName);
        
        // Optimistic update
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, name: slugified } : task
            )
        );
        
        const res = await authenticatedFetch(`/api/tasks`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: taskId, name: slugified })
        });
        const data = await safeJson(res);
        if (!data?.success) {
            setStatus(`❌ Rename task failed: ${data?.error || "unknown error"}`);
            // Revert optimistic update
            await refreshTasks();
            return;
        }
        setStatus("✅ Task renamed successfully");
        await refreshTasks();
    }

    async function deleteTask(taskId: string, taskName: string) {
        if (!confirm(`Are you sure you want to delete the task "${taskName}"? This cannot be undone.`)) return;
        setStatus("");
        const res = await authenticatedFetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
        const data = await safeJson(res);
        if (!data?.success) {
            setStatus(`❌ Delete task failed: ${data?.error || "unknown error"}`);
            return;
        }
        setStatus("✅ Task deleted");
        
        // Immediately remove from local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        
        // Then refresh to ensure sync
        await refreshTasks();
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
                {/* Header with back button */}
                <div className="mb-8">
                    <button
                        onClick={() => window.location.href = '/builder'}
                        className="text-sm text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 transition-colors font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Projects
                    </button>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="font-graffiti text-5xl tracking-tight text-black">{app?.name || "Project"}</h1>
                            <p className="text-gray-500 mt-1 font-medium">
                                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-gray-700">{tasks.length} / {FREE_TIER_LIMITS.TASKS_PER_APP} tasks</div>
                            <div className="text-xs text-gray-500">Free tier limit</div>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium">
                        {status}
                    </div>
                )}

                {/* Task Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            data-tour="task-card"
                            className="group rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col justify-between relative"
                        >
                            <div className="absolute top-4 right-4">
                                <ActionMenu
                                    itemType="task"
                                    onEdit={() => {
                                        setRenameTaskId(task.id);
                                        setRenameTaskName(task.name);
                                        setRenameModalOpen(true);
                                    }}
                                    onDelete={async () => {
                                        await deleteTask(task.id, task.name);
                                    }}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 pr-8">{task.name}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-gray-500 font-medium">
                                        Form: {(fieldCounts[task.name] || 0) > 0 ? "Yes" : "No"}
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {fieldCounts[task.name] || 0} field{(fieldCounts[task.name] || 0) !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="mt-6 w-full rounded-lg bg-scaffold-brand text-black py-2.5 font-graffiti hover:bg-scaffold-brandHover transition-colors"
                                onClick={() => {
                                    window.location.href = `/builder/${appId}/${task.name}`;
                                }}
                            >
                                Edit Task
                            </button>
                        </div>
                    ))}

                    {/* New Task Card */}
                    <div data-tour="create-task" className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer" onClick={() => setShowNewTaskModal(true)}>
                        <div className="text-4xl text-gray-400 mb-3">+</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Task</h3>
                        <button
                            className="w-full rounded-lg bg-scaffold-brand text-black py-2 font-graffiti text-sm hover:bg-scaffold-brandHover transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </div>

                {/* New Task Modal */}
                {showNewTaskModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-2">Create New Task</h2>
                            <p className="text-gray-500 mb-6 text-sm">Tasks represent specific actions your AI will perform.</p>
                            <input
                                type="text"
                                placeholder="Task name (e.g. write_email)"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(slugifyFieldName(e.target.value))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") createTask();
                                }}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 mb-6 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowNewTaskModal(false)}
                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createTask}
                                    className="flex-1 rounded-xl bg-scaffold-brand text-black px-4 py-3 font-graffiti hover:bg-scaffold-brandHover transition-colors"
                                >
                                    Create Task
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rename Modal */}
                <RenameModal
                    isOpen={renameModalOpen}
                    onClose={() => setRenameModalOpen(false)}
                    onRename={(newName) => {
                        if (renameTaskId) {
                            renameTask(renameTaskId, newName);
                        }
                    }}
                    currentName={renameTaskName}
                    itemType="Task"
                />
            </div>
        </main>
    );
}
