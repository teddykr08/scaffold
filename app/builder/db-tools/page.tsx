"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function DbToolsPage() {
    const { user, loading } = useAuth();
    const [status, setStatus] = useState("");

    const runFix = async () => {
        setStatus("Running...");
        const res = await fetch("/api/fix-legacy", { method: "POST" });
        const data = await res.json();
        if (data.success) {
            setStatus("✅ Fixed: Removed 'Additional Instructions' from all your apps.");
        } else {
            setStatus("❌ Error: " + data.error);
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;
    if (!user) return <div className="p-10">Access Denied</div>;

    return (
        <main className="min-h-screen bg-white p-10">
            <h1 className="text-4xl font-bold mb-6">Database Tools & Fixes</h1>

            <div className="bg-gray-50 border p-8 rounded-xl max-w-2xl">
                <h2 className="text-xl font-bold mb-2">Fix Legacy Data</h2>
                <p className="mb-4 text-gray-600">
                    If you see &quot;Additional Instructions&quot; in your form fields where it shouldn&apos;t be,
                    click this button to clean it up.
                </p>

                <button
                    onClick={runFix}
                    className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                >
                    Run Fix Script
                </button>

                {status && (
                    <div className="mt-4 p-4 bg-white border rounded text-lg font-medium">
                        {status}
                    </div>
                )}
            </div>
        </main>
    );
}
