"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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

    const [showNewTaskModal, setShowNewTaskModal] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!appId) return;
        refreshApp();
        refreshTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appId]);

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
        const res = await authenticatedFetch(`/api/tasks?app_id=${encodeURIComponent(appId)}`);
        const data = await safeJson(res);
        if (data?.success) {
            setTasks(data.tasks || []);

            const counts: Record<string, number> = {};
            for (const task of data.tasks || []) {
                // Correctly fetch fields for this task
                const fieldsRes = await fetch(
                    `/api/task-fields?app_id=${encodeURIComponent(appId)}&task_name=${encodeURIComponent(task.name)}`
                );
                const fieldsData = await safeJson(fieldsRes);
                counts[task.name] = ((fieldsData?.fields || []).filter((f: FieldRow) => f.field_type !== "runtime")).length;
            }
            setFieldCounts(counts);
        }
    }

    async function createTask() {
        setStatus("");
        const name = newTaskName.trim();
        if (!name) {
            setStatus("❌ Task name required");
            return;
        }

        const res = await authenticatedFetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                app_id: appId,
                name: slugifyFieldName(name),
            }),
        });
        const data = await safeJson(res);
        if (!data?.success) {
            setStatus(`❌ Create task failed: ${data?.error || "unknown error"}`);
            return;
        }
        setStatus("✅ Task created");
        setNewTaskName("");
        setShowNewTaskModal(false);
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
                    <Link
                        href="/builder"
                        className="text-sm text-gray-500 hover:text-black mb-4 inline-flex items-center gap-1 transition-colors font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Projects
                    </Link>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="font-graffiti text-5xl tracking-tight text-black">{app?.name || "App"}</h1>
                            <p className="text-gray-500 mt-1 font-medium">
                                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                            </p>
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
                            className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
                            onClick={() => router.push(`/builder/${appId}/${task.name}`)}
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/builder/${appId}/${task.name}`);
                                }}
                            >
                                Edit Task
                            </button>
                        </div>
                    ))}

                    {/* New Task Card */}
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer" onClick={() => setShowNewTaskModal(true)}>
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
            </div>
        </main>
    );
}
