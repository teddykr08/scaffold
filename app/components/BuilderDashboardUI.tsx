"use client";

import { useState } from "react";
import Link from "next/link";

type AppRow = {
    id: string;
    name: string;
    task_count: number;
};

interface BuilderDashboardUIProps {
    apps: AppRow[];
    onAppClick: (appId: string) => void;
    onCreateApp: (name: string) => void;
    isDemo?: boolean;
}

export default function BuilderDashboardUI({
    apps,
    onAppClick,
    onCreateApp,
    isDemo = false
}: BuilderDashboardUIProps) {
    const [newAppName, setNewAppName] = useState("");

    const handleCreate = () => {
        if (!newAppName.trim()) return;
        onCreateApp(newAppName);
        setNewAppName("");
    };

    return (
        <main className="min-h-screen bg-white text-gray-900 pb-20">
            <div className="max-w-6xl mx-auto px-6 py-10">
                {/* Banner for Demo Mode */}
                {isDemo && (
                    <div className="mb-12 rounded-3xl bg-black text-white p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-scaffold-brand/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-scaffold-brand/20 transition-all duration-700"></div>
                        <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scaffold-brand/20 text-scaffold-brand text-[10px] font-black uppercase tracking-widest mb-4 border border-scaffold-brand/30">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-scaffold-brand opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-scaffold-brand"></span>
                                </span>
                                Live Demo Mode
                            </div>
                            <h2 className="font-graffiti text-4xl mb-2">Experience Scaffold</h2>
                            <p className="text-gray-400 text-lg max-w-md">This is exactly what a new user sees. Build, test, and preview without an account.</p>
                        </div>
                        <Link href="/login" className="relative z-10 px-8 py-4 bg-scaffold-brand text-black rounded-2xl font-graffiti text-xl hover:bg-scaffold-brandHover transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-scaffold-brand/20">
                            Get Started Free
                        </Link>
                    </div>
                )}

                {/* Header */}
                <div className="mb-12">
                    <h1 className="font-graffiti text-7xl tracking-tighter text-black">Dashboard</h1>
                    <p className="text-gray-500 mt-2 text-xl font-medium uppercase tracking-[0.2em]">Manage your AI form projects</p>
                </div>

                {/* App Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apps.map((app) => (
                        <div
                            key={app.id}
                            className="group rounded-[2.5rem] border border-gray-100 p-10 hover:border-black hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer flex flex-col justify-between bg-white relative overflow-hidden"
                            onClick={() => onAppClick(app.id)}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gray-50 group-hover:bg-scaffold-brand transition-colors duration-500"></div>
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-scaffold-brand/10 transition-colors">
                                        <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                    </div>
                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-scaffold-brand transition-colors">Project</div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{app.name}</h3>
                                <p className="text-sm text-gray-400 font-mono uppercase tracking-widest">{app.task_count || 0} tasks active</p>
                            </div>
                            <div className="mt-10">
                                <button
                                    className="w-full rounded-2xl bg-gray-900 text-white py-4 font-graffiti text-lg hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                                >
                                    Open Project
                                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* New Project Card */}
                    <div className="rounded-[2.5rem] border-2 border-dashed border-gray-200 p-10 flex flex-col items-center justify-center hover:border-scaffold-brand hover:bg-scaffold-brand/[0.02] transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-gray-50 rounded-full group-hover:bg-scaffold-brand/10 transition-all duration-700 blur-2xl"></div>
                        <div className="text-6xl text-gray-200 mb-6 group-hover:text-scaffold-brand group-hover:scale-110 transition-all duration-500 font-light">+</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">Create New Project</h3>
                        <div className="w-full space-y-4 relative z-10">
                            <input
                                type="text"
                                placeholder="Project name..."
                                value={newAppName}
                                onChange={(e) => setNewAppName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreate();
                                }}
                                className="w-full rounded-2xl border border-gray-200 px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all bg-white placeholder:text-gray-300"
                            />
                            <button
                                onClick={handleCreate}
                                className="w-full rounded-2xl bg-scaffold-brand text-black py-4 font-graffiti text-lg hover:bg-scaffold-brandHover transition-all shadow-xl hover:shadow-scaffold-brand/20 active:scale-95"
                            >
                                Create App
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
